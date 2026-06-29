const express = require("express");
const router = express.Router();
const {
  createClassroom,
  getMyClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  joinClassroom,
  leaveClassroom,
  getInstructorClassrooms,
  getClassroomStudents,
  archiveClassroom,
  restoreClassroom,
  getClassroomAnalytics,
  getRecentActivity,
} = require("../controllers/classroomController");

const { getClassroomCourses, assignCourse, unassignCourse } = require("../controllers/courseController");

const {
  protect,
  authorize,
  isVerifiedInstructor,
} = require("../middleware/authMiddleware");

router.use((req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  console.log(
    "User:",
    req.user ? { id: req.user.id, role: req.user.role } : "Not authenticated",
  );
  next();
});

router.use(protect);

router
  .route("/")
  .post(authorize("instructor", "admin"), createClassroom)
  .get(getMyClassrooms);

router.post("/join", joinClassroom);
router.get("/instructor", authorize("instructor", "admin"), getInstructorClassrooms);

router.get("/:classroomId/courses", getClassroomCourses);
router.post("/:classroomId/courses/assign", assignCourse);
router.delete("/:classroomId/courses/:courseId/unassign", unassignCourse);

router
  .route("/:id")
  .get(getClassroomById)
  .put(updateClassroom)
  .delete(deleteClassroom);

router.put("/:id/archive", archiveClassroom);
router.put("/:id/restore", restoreClassroom);
router.post("/:id/leave", leaveClassroom);
router.get("/:id/students", getClassroomStudents);
router.get("/:id/analytics", getClassroomAnalytics);
router.get("/:id/recent-activity", getRecentActivity);

// router.get("/:id/assignments", protect, getClassroomAssignments);

module.exports = router;
