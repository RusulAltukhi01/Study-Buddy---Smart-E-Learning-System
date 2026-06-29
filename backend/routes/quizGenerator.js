const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


router.post("/", async (req, res) => {
    try {
        const { text, num_questions, quiz_type } = req.body;

        const response = await axios.post(
            `${process.env.AI_SERVICE_URL}/generate-quiz`,
            { text, num_questions, quiz_type },
            {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "Content-Type": "application/json"
                },
                timeout: 120000
            }
        );

        res.json(response.data);

    } catch (err) {
        console.error("AI Service error:", err.message);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
});


router.post("/extract-and-generate", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        const num_questions = parseInt(req.body.num_questions) || 5;

        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const response = await axios.post(
            `${process.env.AI_SERVICE_URL}/extract-and-generate?num_questions=${num_questions}`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "ngrok-skip-browser-warning": "true",
                },
                timeout: 300000
            }
        );

        res.json(response.data);

    } catch (err) {
        console.error("Extract error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;