const express  = require("express");
const router   = express.Router();
const axios    = require("axios");
const FormData = require("form-data");
const multer   = require("multer");
const { protect } = require("../middleware/authMiddleware.js");

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 200 * 1024 * 1024 }, 
});


const KAGGLE_STT_AR = process.env.STT_API_URL;     
const KAGGLE_STT_EN = process.env.STT_EN_API_URL;   


function getKaggleUrl(language) {
  if (language === "en") return KAGGLE_STT_EN;
  return KAGGLE_STT_AR;   
}


router.post(
  "/transcribe",
  protect,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "pdf",   maxCount: 1 },
  ]),
  async (req, res) => {
    if (!req.files?.["audio"]) {
      return res.status(400).json({ success: false, error: "Audio file is required" });
    }

    const language  = req.body.language || "ar";   // "ar" | "en"
    const kaggleUrl = getKaggleUrl(language);

    if (!kaggleUrl) {
      const missing = language === "en" ? "STT_EN_API_URL" : "STT_API_URL";
      return res.status(500).json({
        success: false,
        error:   `${missing} not configured in .env — start the ${language === "en" ? "English" : "Arabic"} Kaggle notebook first`,
      });
    }

    try {
      const form  = new FormData();
      const audio = req.files["audio"][0];

      form.append("audio", audio.buffer, {
        filename:    audio.originalname,
        contentType: audio.mimetype,
      });

      
      if (req.files["pdf"] && language === "ar") {
        const pdf = req.files["pdf"][0];
        form.append("pdf", pdf.buffer, {
          filename:    pdf.originalname,
          contentType: pdf.mimetype,
        });
      }

      if (req.body.skip_correction) {
        form.append("skip_correction", req.body.skip_correction);
      }

      const { data } = await axios.post(`${kaggleUrl}/transcribe`, form, {
        headers: {
          ...form.getHeaders(),
          "ngrok-skip-browser-warning": "true",
        },
        maxContentLength: Infinity,
        maxBodyLength:    Infinity,
      });

      if (!data.jobId) {
        return res.status(500).json({
          success: false,
          error:   "Kaggle did not return a jobId",
        });
      }

      
      return res.json({ success: true, jobId: data.jobId, language });

    } catch (err) {
      console.error("STT /transcribe error:", err.response?.data || err.message);
      return res.status(err.response?.status || 500).json({
        success: false,
        error:   err.response?.data?.error || err.message,
      });
    }
  }
);


router.get("/status/:jobId", protect, async (req, res) => {
  const language  = req.query.language || "ar";
  const kaggleUrl = getKaggleUrl(language);

  if (!kaggleUrl) {
    return res.status(500).json({ error: `STT URL not configured for language: ${language}` });
  }

  try {
    const { data } = await axios.get(
      `${kaggleUrl}/status/${req.params.jobId}`,
      {
        headers: { "ngrok-skip-browser-warning": "true" },
        timeout: 10_000,
      }
    );

    if (data.status === "done" && data.result) {
      
      if (language === "ar") {
        return res.json({
          status:     "done",
          transcript: data.result.english_translation || data.result.arabic_transcript,
          summary:    data.result.summary,
          duration:   data.result.duration_seconds,
          segments:   data.result.segments_count,
          pdfUsed:    data.result.pdf_provided,
        });
      }


      return res.json({
        status:     "done",
        transcript: data.result.transcript,
        summary:    data.result.summary,
        duration:   data.result.duration_seconds,
        segments:   data.result.segments_count,
        pdfUsed:    false,
      });
    }

    return res.json({ status: data.status, error: data.error });

  } catch (err) {
    const detail = err.response?.data?.error || err.response?.data || err.message;
    console.error("STT /status error:", detail);
    return res.status(500).json({
      status: "error",
      error:  typeof detail === "string" ? detail : JSON.stringify(detail),
    });
  }
});

module.exports = router;