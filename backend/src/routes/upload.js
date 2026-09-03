import express from "express";
import upload from "../uploads/upload.js";
import cloudinary from "../config/cloudinary.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/upload", protectRoute, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const result = await cloudinary.uploader.upload_stream(
            {
                folder: `pawcare/${req.user._id}`,
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json(error);
                }

                res.json({
                    imageUrl: result.secure_url,
                    ownerId: req.user._id,
                });
            }
        );

        result.end(req.file.buffer);

    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;