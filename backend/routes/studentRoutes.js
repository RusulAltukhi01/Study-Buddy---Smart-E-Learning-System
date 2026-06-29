const express = require("express");
const router = express.Router();
const { protect, isStudent } = require("../middleware/authMiddleware");
const {
  getStudentDashboard,
  getStudentCourses,
  getEnrolledCourses,
  updateLearningGoals,
   getCurrentStudent,
  getStudentProgress,
  getStudentClassrooms,
  getStudentPerformance,
  getClassLeaderboard,
  updateStudentProfile,   
  getStudentStats,       
  addLearningGoal,        
  updateLearningGoalProgress,
  deleteLearningGoal        
} = require("../controllers/studentController");


router.use(protect, isStudent);

router.put("/profile", updateStudentProfile);  
router.get("/stats", getStudentStats);         

router.post("/learning-goals", addLearningGoal);          
router.put("/learning-goals", updateLearningGoals);
router.put("/learning-goals/progress", updateLearningGoalProgress); 
router.delete("/learning-goals/:goalId", deleteLearningGoal); 




router.get("/courses", getStudentCourses);
router.get("/courses/enrolled", getEnrolledCourses);

router.put("/learning-goals", updateLearningGoals);

router.get("/me", getCurrentStudent);
router.get("/classrooms", getStudentClassrooms);
router.get("/progress/:classroomId", getStudentProgress);
router.get("/performance/:classroomId", getStudentPerformance);
router.get("/leaderboard/:classroomId", getClassLeaderboard);

router.get("/dashboard", getStudentDashboard);
router.get("/courses", getStudentCourses);
router.get("/enrolled-courses", getEnrolledCourses);
router.get("/classrooms", getStudentClassrooms);

module.exports = router;