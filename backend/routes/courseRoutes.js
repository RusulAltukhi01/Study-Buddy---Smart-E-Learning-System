const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createCourse,
  saveDraft,
  getMyCourses,
  getCourse,
  updateCourse,
  archiveCourse,
} = require("../controllers/courseController");

router.use(protect);

router.post("/", createCourse);
router.post("/draft", saveDraft);
router.get("/my", getMyCourses);
router.get("/:id", getCourse);
router.patch("/:id", updateCourse);
router.delete("/:id", archiveCourse);

module.exports = router;