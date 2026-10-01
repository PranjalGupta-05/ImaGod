import cloudinary from "../config/cloudinary.js";

// GET /api/user/history?feature=all&page=1&limit=50
export const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const { feature = 'all', page = 1, limit = 50 } = req.query;

        // FOLDER_MAP matches public_id prefix for each feature
        const FOLDER_MAP = {
            textToImage: 'imagify/generated',
            removeBg: 'imagify/bg-removal',
            enhance: 'imagify/enhance',
            genReplace: 'imagify/gen-replace',
            genRecolor: 'imagify/gen-recolor',
            genFill: 'imagify/gen-fill',
            unblur: 'imagify/unblur',
        };

        // Query by public_id prefix and user tag
        let expression = `public_id:imagify/* AND tags=${userId}`;

        if (feature !== 'all' && FOLDER_MAP[feature]) {
            expression = `public_id:${FOLDER_MAP[feature]}/* AND tags=${userId}`;
        }

        const result = await cloudinary.search
            .expression(expression)
            .sort_by('created_at', 'desc')
            .max_results(parseInt(limit))
            .with_field('tags')
            .with_field('context')
            .execute();

        // Map results to a clean response
        const images = (result.resources || []).map((r) => {
            const publicId = r.public_id || '';
            const folder = r.asset_folder || r.folder || '';
            let detectedFeature = 'unknown';

            for (const [key, val] of Object.entries(FOLDER_MAP)) {
                if (publicId.startsWith(val) || folder.startsWith(val)) {
                    detectedFeature = key;
                    break;
                }
            }

            // Extract prompt if available (from context)
            const prompt = r.context?.prompt || r.context?.custom?.prompt || '';

            // Compute appropriate high-res URL based on feature
            let url = r.secure_url;
            if (detectedFeature === 'removeBg') {
                url = cloudinary.url(r.public_id, { format: 'png', secure: true });
            } else if (detectedFeature === 'enhance') {
                url = cloudinary.url(r.public_id, {
                    transformation: [
                        { effect: 'improve' },
                        { effect: 'upscale' },
                        { quality: 'auto:best' },
                    ],
                    format: 'jpg',
                    secure: true,
                });
            } else if (detectedFeature === 'unblur') {
                url = cloudinary.url(r.public_id, {
                    transformation: [
                        { effect: 'unsharp_mask:400' },
                        { effect: 'sharpen:150' },
                        { effect: 'improve' },
                        { quality: 'auto:best' },
                    ],
                    format: 'jpg',
                    secure: true,
                });
            }

            // Generate thumbnail
            let thumbnail;
            if (detectedFeature === 'removeBg') {
                thumbnail = cloudinary.url(r.public_id, {
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
                    ],
                    format: 'png',
                    secure: true,
                });
            } else {
                thumbnail = cloudinary.url(r.public_id, {
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
                        { quality: 'auto', fetch_format: 'auto' },
                    ],
                    secure: true,
                });
            }

            return {
                publicId: r.public_id,
                url,
                thumbnail,
                feature: detectedFeature,
                prompt,
                format: r.format,
                width: r.width,
                height: r.height,
                bytes: r.bytes,
                createdAt: r.created_at,
            };
        });

        res.json({
            success: true,
            images,
            total: result.total_count || images.length,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        console.log('History Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};

// POST /api/user/history/delete
export const deleteHistoryItem = async (req, res) => {
    try {
        const { userId, publicId } = req.body;
        if (!publicId) {
            return res.json({ success: false, message: 'Missing publicId' });
        }

        // Verify asset belongs to user by checking tags
        const resource = await cloudinary.api.resource(publicId, { tags: true });
        if (!resource.tags || !resource.tags.includes(userId)) {
            return res.json({ success: false, message: 'Unauthorized: this image does not belong to you' });
        }

        await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.log('Delete History Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};
