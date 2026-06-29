const express = require("express");
const router = express.Router();
const {
  studentSignup,
  instructorSignup,
  login,
  getMe,
  logout,
  updateProfile,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/authController");

const {
  protect,
  authorize,
  isStudent,
  isEmailVerified,
} = require("../middleware/authMiddleware");

router.post("/signup/student", studentSignup);
router.post("/signup/instructor", instructorSignup);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", protect, verifyOTP);
router.post("/resend-otp", protect, resendOTP);

// Protected routes
router.get("/me", protect, isEmailVerified, getMe);
router.put("/profile", protect, isEmailVerified, updateProfile);
router.post("/logout", protect, logout);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth service is running",
    timestamp: new Date().toISOString(),
  });
});

router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const [student, instructor] = await Promise.all([
      require("../models/Student").findOne({ email }),
      require("../models/Instructor").findOne({ email }),
    ]);

    const exists = !!(student || instructor);

    res.json({
      success: true,
      data: { exists },
    });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;
