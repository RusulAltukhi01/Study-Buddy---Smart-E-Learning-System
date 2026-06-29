const express = require("express");
const router = express.Router();
const { protect, isStudent } = require("../middleware/authMiddleware");
const {
  upload,
  createAssignment,
  getAssignments,
  getStudentAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  removeAttachedFile,
  submitAssignment,
  getMyGrade,
  getMyGrades,
  gradeSubmission,
} = require("../controllers/assignmentController");

router.use(protect);




router.get("/student", isStudent, getStudentAssignments);
router.get("/student/my-grade/:assignmentId", isStudent, getMyGrade);
router.get("/student/my-grades/:classroomId", isStudent, getMyGrades);


router.route("/")
  .get(getAssignments)
  .post(upload, createAssignment);


router.put("/:assignmentId/submissions/:studentId/grade", gradeSubmission);
router.post("/:id/submit", upload, submitAssignment);
router.delete("/:id/files/:fileId", removeAttachedFile);


router.route("/:id")
  .get(getAssignmentById)
  .put(upload, updateAssignment)
  .delete(deleteAssignment);

module.exports = router;