import cloudinary from '../config/cloudinary.js';
import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import razorpay from 'razorpay'
import transactionModel from "../models/transactionModel.js";

const registerUser = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.json({success:false, message: 'Missing Details'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

        res.json({success: true, token, user: {name: user.name}})

    }catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const loginUser = async (req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email})
        
        if(!user){
            return res.json({success:false, message: 'User does not exist'})
        }
        
        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch){
             const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

             res.json({success: true, token, user: {name: user.name}})

        }else{
            return res.json({success:false, message: 'Invalid credentials'})
        }

    }catch{
         console.log(error)
        res.json({success: false, message: error.message})
    
    }
}

const userCredits = async (req, res)=>{
    try{
        const {userId} = req.body

        const user = await userModel.findById(userId)
        res.json({success: true, credits: user.creditBalance, user:{name: user.name}})
    } catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async(req, res)=> {
    try{
        const {userId, planId} = req.body

        const userData = await userModel.findById(userId)

        if(!userId || !planId){
              return res.json({success: false, message: 'Missing Details'})
        }

        let credits, plan, amount, date

        switch(planId){
              case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
                break;

              case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50
                break;

              case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250
                break;

              default:
                return res.json({success: false, message: 'plan not found'});
        }

        date = Date.now();

        const transactionData = {
            userId, plan, amount, credits, date
        }

        const newTransaction = await transactionModel.create(transactionData)

        const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY,
            receipt: newTransaction._id,
        }

        await razorpayInstance.orders.create(options, (error, order)=>{
                if (error){
                    console.log(error);
                    return res.json({success: false, message: error})
                }
                res.json({success: true, order})
        })

    } catch (error){
        console.log(error)
        res.json({success: false, message: error.message })
    }
}

const verifyRazorpay = async (req, res)=>{
    try{

        const {razorpay_order_id} = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if(orderInfo.status == 'paid'){
            const transactionData = await transactionModel.findById(orderInfo.receipt)
            if(transactionData.payment){
                return res.json({success: false, message: 'Payment Failed'})
            }

            const userData = await userModel.findById(transactionData.userId)

            const creditBalance = userData.creditBalance + transactionData.credits
            await userModel.findByIdAndUpdate(userData._id, {creditBalance})

            await transactionModel.findByIdAndUpdate(transactionData._id, {payment: true})

            res.json({success: true, message: "Credits Added"})
        }else{
            res.json({success: false, message: "Payment Failed"})
        }

    }catch(error){
        console.log(error);
        res.json({success: false, message:error.message});
    }
}


const getUserUsage = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        let logs = user.usageLogs;
        const currentTotal = logs?.totalUsed || (
            (logs?.textToImage || 0) +
            (logs?.removeBg    || 0) +
            (logs?.enhance     || 0) +
            (logs?.aiEditor    || 0) +
            (logs?.genFill     || 0) +
            (logs?.unblur      || 0)
        );

        // Auto-sync once from Cloudinary if usageLogs has 0 / not initialized
        if (!currentTotal || currentTotal === 0) {
            try {
                const cldRes = await cloudinary.search
                    .expression(`public_id:imagify/* AND tags=${userId}`)
                    .max_results(500)
                    .execute();

                const resources = cldRes.resources || [];
                if (resources.length > 0) {
                    let textToImage = 0;
                    let removeBg = 0;
                    let enhance = 0;
                    let aiEditor = 0;
                    let genFill = 0;
                    let unblur = 0;

                    resources.forEach((r) => {
                        const pid = r.public_id || '';
                        if (pid.startsWith('imagify/generated')) textToImage++;
                        else if (pid.startsWith('imagify/bg-removal')) removeBg++;
                        else if (pid.startsWith('imagify/enhance')) enhance++;
                        else if (pid.startsWith('imagify/gen-replace') || pid.startsWith('imagify/gen-recolor')) aiEditor++;
                        else if (pid.startsWith('imagify/gen-fill')) genFill++;
                        else if (pid.startsWith('imagify/unblur')) unblur++;
                    });

                    const totalUsed = textToImage + removeBg + enhance + aiEditor + genFill + unblur;

                    logs = {
                        textToImage,
                        removeBg,
                        enhance,
                        aiEditor,
                        genFill,
                        unblur,
                        totalUsed,
                    };

                    await userModel.findByIdAndUpdate(userId, { usageLogs: logs });
                }
            } catch (cldErr) {
                console.log('Cloudinary auto-sync error in getUserUsage:', cldErr.message);
            }
        }

        const textToImage = logs?.textToImage || 0;
        const removeBg    = logs?.removeBg    || 0;
        const enhance     = logs?.enhance     || 0;
        const aiEditor    = logs?.aiEditor    || 0;
        const genFill     = logs?.genFill     || 0;
        const unblur      = logs?.unblur      || 0;
        const totalUsed   = logs?.totalUsed ?? (textToImage + removeBg + enhance + aiEditor + genFill + unblur);

        const creditsLeft  = user.creditBalance;
        const creditsUsed  = totalUsed;
        const totalCredits = creditsLeft + creditsUsed;

        res.json({
            success: true,
            data: {
                creditsLeft,
                creditsUsed,
                totalCredits,
                features: {
                    textToImage,
                    removeBg,
                    enhance,
                    aiEditor,
                    genFill,
                    unblur,
                },
            },
        });
    } catch (error) {
        console.log('Usage Error:', error.message);
        res.json({ success: false, message: error.message });
    }
}
export {registerUser, loginUser, userCredits, paymentRazorpay, verifyRazorpay, getUserUsage}


