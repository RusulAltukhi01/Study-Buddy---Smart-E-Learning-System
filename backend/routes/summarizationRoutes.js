const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const router = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});


router.post("/", upload.single("file"), async (req, res) => {
    try {
        console.log("Summarization route was hit!"); 
        console.log("File:", req.file ? req.file.originalname : "No file");
        // Validate file
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: "No file uploaded" 
            });
        }

        if (!req.file.originalname.toLowerCase().endsWith(".pdf")) {
            return res.status(400).json({ 
                success: false, 
                error: "Only PDF files are supported" 
            });
        }

  
        const format = req.body.format || "bullets";
        const detail = req.body.detail || "standard";

        console.log(`Processing PDF: ${req.file.originalname}`);
        console.log(`Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Format: ${format}, Detail: ${detail}`);

   
        if (!process.env.AI_SUMMARY_URL) {
            console.error("AI_SUMMARY_URL not configured");
            return res.status(500).json({ 
                success: false, 
                error: "AI service not configured" 
            });
        }

    
        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        
        const aiResponse = await axios.post(
            `${process.env.AI_SUMMARY_URL}/extract-and-summarize`,
            formData,
            {
                params: {  
                    format: format,
                    detail: detail
                },
                headers: {
                    ...formData.getHeaders(),
                    "ngrok-skip-browser-warning": "true",
                },
                // timeout: 600000, // 5 minutes
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log("Summary generated successfully");
        
     
        res.json(aiResponse.data);

    } catch (err) {
        console.error("Error in summarization route:", err);
        
        
        if (err.response) {
            console.error(`   Status: ${err.response.status}`);
            console.error(`   Data:`, err.response.data);
            return res.status(err.response.status).json({
                success: false,
                error: err.response.data?.error || "AI service error"
            });
        }
        
        if (err.code === 'ECONNABORTED') {
            return res.status(504).json({ 
                success: false, 
                error: "Request timeout - file may be too large" 
            });
        }
        
        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                success: false, 
                error: "AI service unavailable. Make sure Kaggle notebook is running." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});


module.exports = router;