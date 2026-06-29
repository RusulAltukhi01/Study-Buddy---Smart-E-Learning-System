const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getInstructorById,
  getInstructorDashboard,
  getInstructorCourses,
  createCourse,
  getInstructorAnalytics,
  getInstructorStudents,
  updateInstructorProfile,
  getMyProfile,
} = require("../controllers/instructorController");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profiles/";
    if (!require("fs").existsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `instructor-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
    }
  },
});

router.use(protect);

// Profile routes
router.get("/me", getMyProfile);
router.put("/profile", updateInstructorProfile);
router.post("/upload-photo", upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Other routes
router.get("/dashboard", getInstructorDashboard);
router.get("/courses", getInstructorCourses);
router.get("/students", getInstructorStudents);
router.get("/analytics", getInstructorAnalytics);
router.post("/courses", createCourse);
router.get("/:instructorId", getInstructorById);

module.exports = router;