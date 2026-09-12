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

        const formData = new FormData();
        formData.append('prompt', prompt);

        const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                ...formData.getHeaders(),
                'x-api-key': process.env.CLIPDROP_API,
            },
            responseType: 'arraybuffer'
        });

        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 });

        res.json({ success: true, message: "Image Generated", creditBalance: user.creditBalance - 1, resultImage });

    } catch (error) {
        console.log("Error Message:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ─── Helper: poll until Cloudinary background removal is done ─────────────────
const pollForResult = async (publicId, maxWaitMs = 60000) => {
    const interval = 2000;
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        const result = await cloudinary.api.resource(publicId);
        const status = result.info?.background_removal?.cloudinary_ai?.status;
        if (status === 'complete') return result;
        if (status === 'failed') throw new Error('Cloudinary background removal failed');
        await new Promise(r => setTimeout(r, interval));
    }
    throw new Error('Cloudinary background removal timed out');
};

// ─── Background Removal ───────────────────────────────────────────────────────
export const removeBg = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/bg-removal', background_removal: 'cloudinary_ai' },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            uploadStream.end(req.file.buffer);
        });

        const finalResult = await pollForResult(uploadResult.public_id);

        const resultImageUrl = cloudinary.url(finalResult.public_id, {
            format: 'png',
            background_removal: 'cloudinary_ai',
        });

        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 });

        res.json({ success: true, message: 'Background removed successfully', creditBalance: user.creditBalance - 1, resultImage: resultImageUrl });

    } catch (error) {
        console.log("BG Removal Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// ─── AI Image Enhance & Restore ───────────────────────────────────────────────
export const enhanceImage = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });

        // Step 1: Upload original image (no eager transforms)
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/enhance' },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            uploadStream.end(req.file.buffer);
        });

        // Step 2: Build the URL with chained AI enhancement effects.
        // Each effect is a SEPARATE object in the transformation array.
        // Valid Cloudinary effects: upscale, enhance, sharpen
        const resultImageUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                { effect: 'upscale' },
                { effect: 'enhance' },
                { effect: 'sharpen:100' },
                { quality: 'auto:best' },
            ],
            format: 'jpg',
            secure: true,
        });

        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 });

        res.json({
            success: true,
            message: 'Image enhanced successfully',
            creditBalance: user.creditBalance - 1,
            resultImage: resultImageUrl,
        });

    } catch (error) {
        console.log('Enhance Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};