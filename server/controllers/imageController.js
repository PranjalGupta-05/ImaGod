import axios from "axios";
import userModel from "../models/userModel.js";
import FormData from "form-data";
import cloudinary from "../config/cloudinary.js";

export const generateImage = async (req, res) => {
    try {
        const { userId, prompt } = req.body;

        const user = await userModel.findById(userId);

        if (!user || !prompt) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        if (user.creditBalance <= 0) {
            return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
        }

        // Call ClipDrop API
        const formData = new FormData();
        formData.append('prompt', prompt);

        const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                ...formData.getHeaders(),
                'x-api-key': process.env.CLIPDROP_API,
            },
            responseType: 'arraybuffer'
        });

        // Convert the raw binary data into a Base64 string for the React frontend
        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        // Deduct 1 credit
        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 });

        res.json({ success: true, message: "Image Generated", creditBalance: user.creditBalance - 1, resultImage });

    } catch (error) {
        console.log("Error Message:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Helper: poll Cloudinary until the background_removal transformation is complete
const pollForResult = async (publicId, maxWaitMs = 60000) => {
    const interval = 2000;
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
        const result = await cloudinary.api.resource(publicId);
        
        // The status is nested under the specific AI model name 'cloudinary_ai'
        const status = result.info?.background_removal?.cloudinary_ai?.status;
        
        if (status === 'complete') {
            return result;
        }
        if (status === 'failed') {
            throw new Error('Cloudinary background removal failed');
        }
        // Still pending – wait before next poll
        await new Promise(r => setTimeout(r, interval));
    }
    throw new Error('Cloudinary background removal timed out');
};

export const removeBg = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) {
            return res.json({ success: false, message: 'No image file uploaded' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.creditBalance <= 0) {
            return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
        }

        // Upload to Cloudinary and trigger background removal in one step
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'imagify/bg-removal',
                    background_removal: 'cloudinary_ai',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Poll until background removal is done (it's async on Cloudinary's side)
        const finalResult = await pollForResult(uploadResult.public_id);

        // Build the URL for the processed image (transparent PNG)
        const resultImageUrl = cloudinary.url(finalResult.public_id, {
            format: 'png',
            background_removal: 'cloudinary_ai',
        });

        // Deduct 1 credit
        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 });

        res.json({
            success: true,
            message: 'Background removed successfully',
            creditBalance: user.creditBalance - 1,
            resultImage: resultImageUrl,
        });

    } catch (error) {
        console.log("BG Removal Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};