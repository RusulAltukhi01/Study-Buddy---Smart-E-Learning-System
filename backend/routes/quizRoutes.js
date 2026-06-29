const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  upload,
  createQuiz,
  createPersonalQuiz,
  getQuizzes,
  getMyPersonalQuizzes,
  getStudentQuizzes,
  getQuizById,
  publishQuiz,
  submitQuiz,
  deleteQuiz,
  getClassroomQuizzesForStudent,
  updateQuiz,
} = require("../controllers/quizController");
const { notifyQuizOpened } = require('../services/notificationService');
const Classroom = require('../models/Classroom');
const Quiz = require("../models/Quiz");

router.use(protect);

router.get("/", getQuizzes);
router.get("/my-personal-quizzes", getMyPersonalQuizzes);
router.post("/", upload, createQuiz);
router.post("/personal", createPersonalQuiz);

router.get("/student", getStudentQuizzes);
router.get("/classroom/:classroomId", getClassroomQuizzesForStudent);

router.get("/:id", getQuizById);
router.patch("/:id/publish", publishQuiz);
router.post("/:id/submit", submitQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

router.patch("/:id/open", protect, async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { isOpen: true },
    { new: true },
  );

  const classroom = await Classroom.findById(quiz.classroom).select("students");
  await notifyQuizOpened({ quiz, classroomStudentIds: classroom.students });

  res.json({ success: true, data: quiz });
});

module.exports = router;
