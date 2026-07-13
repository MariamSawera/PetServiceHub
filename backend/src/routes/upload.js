const express = require("express");
const router = express.Router();
const upload = require("../uploads/upload");
const cloudinary = require("../config/cloudinary");

router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload_stream(
            {
                folder: "my-project",
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json(error);
                }

                res.json({
                    imageUrl: result.secure_url,
                });
            }
        );

        result.end(req.file.buffer);

    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;