import axios from "axios";
import userModel from "../models/userModel.js";
import FormData from "form-data";
import cloudinary from "../config/cloudinary.js";

export const generateImage = async (req, res) => {
    try {
        const { userId, prompt } = req.body;
        const user = await userModel.findById(userId);
        if (!user || !prompt) return res.json({ success: false, message: 'Missing Details' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });

        // Use Cloudinary Image Generation API (text_to_image)
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        const publicId = `imagify/generated/${Date.now()}`;
        const { data } = await axios.post(
            `https://api.cloudinary.com/v2/generate/${cloudName}/text_to_image`,
            {
                prompt,
                model: { mode: 'auto', preference: 'quality' },
                image_size: { aspect_ratio: '1:1', resolution: '1K' },
                target: { target_type: 'managed_asset', public_id: publicId },
            },
            {
                auth: { username: apiKey, password: apiSecret },
                headers: { 'Content-Type': 'application/json' },
            }
        );

        const resultImage = data?.data?.assets?.[0]?.storage?.secure_url;
        if (!resultImage) return res.json({ success: false, message: 'Image generation failed' });

        // Explicitly tag the newly generated asset with user ID so it appears in History
        try {
            await cloudinary.uploader.add_tag(userId, [publicId]);
        } catch (tagErr) {
            console.log('Error tagging generated asset:', tagErr.message);
        }

        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1, $inc: { 'usageLogs.textToImage': 1, 'usageLogs.totalUsed': 1 } });
        res.json({ success: true, message: "Image Generated", creditBalance: user.creditBalance - 1, resultImage });
    } catch (error) {
        console.log("Error Message:", error.message);
        res.json({ success: false, message: error.message });
    }
};

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

export const removeBg = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/bg-removal', background_removal: 'cloudinary_ai', tags: [userId] },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            stream.end(req.file.buffer);
        });
        const finalResult = await pollForResult(uploadResult.public_id);
        const resultImageUrl = cloudinary.url(finalResult.public_id, { format: 'png', secure: true });
        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1, $inc: { 'usageLogs.removeBg': 1, 'usageLogs.totalUsed': 1 } });
        res.json({ success: true, message: 'Background removed successfully', creditBalance: user.creditBalance - 1, resultImage: resultImageUrl });
    } catch (error) {
        console.log("BG Removal Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

export const enhanceImage = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/enhance', tags: [userId] },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            stream.end(req.file.buffer);
        });
        const resultImageUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                { effect: 'improve' },
                { effect: 'upscale' },
                { quality: 'auto:best' },
            ],
            format: 'jpg',
            secure: true,
        });
        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1, $inc: { 'usageLogs.enhance': 1, 'usageLogs.totalUsed': 1 } });
        res.json({ success: true, message: 'Image enhanced successfully', creditBalance: user.creditBalance - 1, resultImage: resultImageUrl });
    } catch (error) {
        console.log('Enhance Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};

// -- Generative Replace --------------------------------------------------------
export const genReplace = async (req, res) => {
    try {
        const { userId, from, to } = req.body;
        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });
        if (!from || !to) return res.json({ success: false, message: 'Please provide both "from" and "to" prompts' });
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/gen-replace', tags: [userId] },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            stream.end(req.file.buffer);
        });
        // gen_replace: swap `from` object with `to` description
        const resultImageUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                { effect: `gen_replace:from_${encodeURIComponent(from)};to_${encodeURIComponent(to)}` },
                { quality: 'auto:best' },
            ],
            format: 'jpg',
            secure: true,
        });
        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1, $inc: { 'usageLogs.aiEditor': 1, 'usageLogs.totalUsed': 1 } });
        res.json({ success: true, message: 'Object replaced successfully', creditBalance: user.creditBalance - 1, resultImage: resultImageUrl });
    } catch (error) {
        console.log('Gen Replace Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};

// -- Generative Recolor --------------------------------------------------------
export const genRecolor = async (req, res) => {
    try {
        const { userId, prompt, color } = req.body;
        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });
        if (!prompt || !color) return res.json({ success: false, message: 'Please provide both "prompt" (object) and "color"' });
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/gen-recolor', tags: [userId] },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            stream.end(req.file.buffer);
        });
        const resultImageUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                { effect: `gen_recolor:prompt_${encodeURIComponent(prompt)};to-color_${encodeURIComponent(color)}` },
                { quality: 'auto:best' },
            ],
            format: 'jpg',
            secure: true,
        });
        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1, $inc: { 'usageLogs.aiEditor': 1, 'usageLogs.totalUsed': 1 } });
        res.json({ success: true, message: 'Object recolored successfully', creditBalance: user.creditBalance - 1, resultImage: resultImageUrl });
    } catch (error) {
        console.log('Gen Recolor Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};

// -- Generative Fill / Outpainting ---------------------------------------------
export const genFill = async (req, res) => {
    try {
        const { userId, aspectRatio } = req.body;
        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });
        if (!aspectRatio) return res.json({ success: false, message: 'Please provide a target aspect ratio' });
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });

        // Aspect ratio map ? width x height targets
        const AR_MAP = {
            '16:9':  { width: 1280, height: 720 },
            '9:16':  { width: 720,  height: 1280 },
            '4:3':   { width: 1200, height: 900 },
            '1:1':   { width: 1080, height: 1080 },
            '21:9':  { width: 1680, height: 720 },
            '3:4':   { width: 900,  height: 1200 },
        };
        const dims = AR_MAP[aspectRatio] || { width: 1280, height: 720 };

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/gen-fill', tags: [userId] },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            stream.end(req.file.buffer);
        });

        const resultImageUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                {
                    width: dims.width,
                    height: dims.height,
                    crop: 'pad',
                    gravity: 'center',
                    background: 'gen_fill',
                },
                { quality: 'auto:best' },
            ],
            format: 'jpg',
            secure: true,
        });

        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1, $inc: { 'usageLogs.genFill': 1, 'usageLogs.totalUsed': 1 } });
        res.json({ success: true, message: 'Image filled successfully', creditBalance: user.creditBalance - 1, resultImage: resultImageUrl });
    } catch (error) {
        console.log('Gen Fill Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};

// ?? AI Unblur / Deblur ??
export const unblurImage = async (req, res) => {
    try {
        const { userId, mode = 'standard' } = req.body;
        if (!req.file) return res.json({ success: false, message: 'No image file uploaded' });
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.creditBalance <= 0) return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'imagify/unblur', tags: [userId] },
                (error, result) => { if (error) return reject(error); resolve(result); }
            );
            stream.end(req.file.buffer);
        });

        let transformation = [
            { effect: 'unsharp_mask:400' },
            { effect: 'sharpen:150' },
            { effect: 'improve' },
            { effect: 'upscale' },
            { quality: 'auto:best' },
        ];

        if (mode === 'motion') {
            transformation = [
                { effect: 'unsharp_mask:650' },
                { effect: 'sharpen:200' },
                { effect: 'improve' },
                { quality: 'auto:best' },
            ];
        } else if (mode === 'face') {
            transformation = [
                { effect: 'improve' },
                { effect: 'sharpen:150' },
                { effect: 'enhance' },
                { effect: 'upscale' },
                { quality: 'auto:best' },
            ];
        }

        const resultImageUrl = cloudinary.url(uploadResult.public_id, {
            transformation,
            format: 'jpg',
            secure: true,
        });

        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1, $inc: { 'usageLogs.unblur': 1, 'usageLogs.totalUsed': 1 } });
        res.json({
            success: true,
            message: 'Image unblurred successfully',
            creditBalance: user.creditBalance - 1,
            resultImage: resultImageUrl,
        });
    } catch (error) {
        console.log('Unblur Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};




