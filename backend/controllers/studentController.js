const Student = require("../models/Student");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");

const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate({
        path: "coursesEnrolled",
        select: "title instructor thumbnail category price progress",
        populate: {
          path: "instructor",
          select: "firstName lastName headline profilePicture",
        },
      })
      .populate({
        path: "completedCourses.courseId",
        select: "title instructor certificateUrl completedAt",
      });

    const dashboardData = {
      summary: {
        totalCourses: student.coursesEnrolled?.length || 0,
        completedCourses: student.completedCourses?.length || 0,
        inProgressCourses:
          student.coursesEnrolled?.filter(
            (c) => c.progress > 0 && c.progress < 100,
          ).length || 0,
        totalStudyHours: student.totalStudyHours || 0,
        badgesEarned: student.badges?.length || 0,
        certificates: student.certificates?.length || 0,
      },
      recentCourses: student.coursesEnrolled?.slice(0, 5) || [],
      completedCourses: student.completedCourses?.slice(0, 5) || [],
      wishlist: student.wishlist?.slice(0, 5) || [],
      upcomingDeadlines: [],
      learningGoals: student.learningGoals || [],
      streak: {
        current: 7, 
        longest: 30,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get student dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting dashboard",
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Allowed fields that can be updated
    const allowedFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "bio",
      "educationLevel",
      "institution",
      "fieldOfStudy",
      "graduationYear",
      "interests",
      "learningGoals",
      "emailNotifications",
      "isPublic",
      "showOnLeaderboard",
    ];

    // Build update object from allowed fields
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    
    if (req.body.profilePicture !== undefined) {
      updates.profilePicture = req.body.profilePicture;
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    return res.json({
      success: true,
      data: student,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("updateStudentProfile error:", err.message);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }
    return res.status(500).json({
      success: false,
      error: "Server error updating profile",
    });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .populate("coursesEnrolled.course")
      .populate("completedCourses.course");

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }


    const totalCourses = student.coursesEnrolled?.length || 0;
    const completedCourses = student.completedCourses?.length || 0;
    const totalStudyHours = student.totalStudyHours || 0;

    
    let totalScore = 0;
    let scoredCourses = 0;

    student.completedCourses?.forEach((course) => {
      if (course.finalScore) {
        totalScore += course.finalScore;
        scoredCourses++;
      }
    });

    const averageScore =
      scoredCourses > 0 ? Math.round(totalScore / scoredCourses) : 0;

    return res.json({
      success: true,
      data: {
        totalCourses,
        completedCourses,
        totalStudyHours,
        averageScore,
        inProgressCourses: totalCourses - completedCourses,
        badgesEarned: student.badges?.length || 0,
        certificates: student.certificates?.length || 0,
      },
    });
  } catch (err) {
    console.error("getStudentStats error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Server error getting stats",
    });
  }
};

const getStudentCourses = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const student = await Student.findById(req.user.id).populate({
      path: "coursesEnrolled",
      select:
        "title instructor description thumbnail price progress lastAccessed",
      match:
        status === "completed"
          ? { progress: 100 }
          : status === "in-progress"
            ? { progress: { $gt: 0, $lt: 100 } }
            : status === "not-started"
              ? { progress: 0 }
              : {},
      populate: {
        path: "instructor",
        select: "firstName lastName profilePicture",
      },
    });

    const courses = student.coursesEnrolled || [];

    res.json({
      success: true,
      data: {
        total: courses.length,
        courses: courses,
        filters: {
          all: courses.length,
          completed: courses.filter((c) => c.progress === 100).length,
          inProgress: courses.filter((c) => c.progress > 0 && c.progress < 100)
            .length,
          notStarted: courses.filter((c) => c.progress === 0).length,
        },
      },
    });
  } catch (error) {
    console.error("Get student courses error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting courses",
    });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).populate({
      path: "coursesEnrolled",
      select:
        "title instructor category price progress enrollmentDate lastAccessed",
      populate: {
        path: "instructor",
        select: "firstName lastName profilePicture",
      },
    });

    const enrolledCourses =
      student.coursesEnrolled?.map((course) => ({
        _id: course._id,
        title: course.title,
        instructor: course.instructor,
        category: course.category,
        price: course.price,
        progress: course.progress,
        enrollmentDate: course.enrollmentDate,
        lastAccessed: course.lastAccessed,
      })) || [];

    res.json({
      success: true,
      data: {
        total: enrolledCourses.length,
        courses: enrolledCourses,
      },
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting enrolled courses",
    });
  }
};

const addLearningGoal = async (req, res) => {
  try {
    const { goal, targetDate } = req.body;

    if (!goal) {
      return res.status(400).json({
        success: false,
        error: "Goal is required",
      });
    }

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    const newGoal = {
      goal,
      targetDate: targetDate || null,
      progress: 0,
      achieved: false,
      createdAt: new Date(),
    };

    student.learningGoals.push(newGoal);
    await student.save();

    return res.json({
      success: true,
      data: student.learningGoals,
      message: "Learning goal added successfully",
    });
  } catch (err) {
    console.error("addLearningGoal error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Server error adding learning goal",
    });
  }
};

const updateLearningGoals = async (req, res) => {
  try {
    const { learningGoals } = req.body;

    if (!Array.isArray(learningGoals)) {
      return res.status(400).json({
        success: false,
        error: "Learning goals must be an array",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { learningGoals },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: {
        learningGoals: student.learningGoals,
      },
      message: "Learning goals updated successfully",
    });
  } catch (error) {
    console.error("Update learning goals error:", error);
    res.status(500).json({
      success: false,
      error: "Server error updating learning goals",
    });
  }
};
const updateLearningGoalProgress = async (req, res) => {
  try {
    const { goalId, progress } = req.body;

    if (!goalId || progress === undefined) {
      return res.status(400).json({
        success: false,
        error: "Goal ID and progress are required",
      });
    }

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    const goal = student.learningGoals.id(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Learning goal not found",
      });
    }

    goal.progress = Math.min(100, Math.max(0, progress));
    goal.achieved = goal.progress === 100;

    await student.save();

    return res.json({
      success: true,
      data: student.learningGoals,
      message: "Learning goal updated successfully",
    });
  } catch (err) {
    console.error("updateLearningGoalProgress error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Server error updating learning goal",
    });
  }
};

const deleteLearningGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    student.learningGoals = student.learningGoals.filter(
      (goal) => goal._id.toString() !== goalId,
    );

    await student.save();

    return res.json({
      success: true,
      data: student.learningGoals,
      message: "Learning goal removed successfully",
    });
  } catch (err) {
    console.error("deleteLearningGoal error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Server error deleting learning goal",
    });
  }
};

const getCurrentStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate("classroomsEnrolled.classroom", "name description instructor")
      .populate("coursesEnrolled.course", "title description");

    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "Student not found" });
    }

    return res.json({ success: true, data: student });
  } catch (err) {
    console.error("getCurrentStudent error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getStudentProgress = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user.id;

    const quizzes = await Quiz.find({
      classroom: classroomId,
      status: "published",
    });

    const assignments = await Assignment.find({
      classroom: classroomId,
    });

    let completedQuizzes = 0;
    let totalQuizScore = 0;

    for (const quiz of quizzes) {
      const submission = quiz.submissions?.find(
        (s) => s.student?.toString() === studentId,
      );
      if (submission) {
        completedQuizzes++;
        totalQuizScore += submission.percentage || 0;
      }
    }

    const averageQuizScore =
      completedQuizzes > 0 ? totalQuizScore / completedQuizzes : 0;

    let completedAssignments = 0;
    let totalAssignmentScore = 0;

    for (const assignment of assignments) {
      const submission = assignment.submissions?.find(
        (s) => s.student?.toString() === studentId,
      );
      if (submission) {
        completedAssignments++;
        totalAssignmentScore += submission.grade || submission.score || 0;
      }
    }

    const averageAssignmentScore =
      completedAssignments > 0
        ? totalAssignmentScore / completedAssignments
        : 0;

    const totalQuizzes = quizzes.length;
    const totalAssignments = assignments.length;
    const totalItems = totalQuizzes + totalAssignments;
    const completedItems = completedQuizzes + completedAssignments;

    const completionRate =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const overallAverage =
      completedItems > 0
        ? (averageQuizScore * completedQuizzes +
            averageAssignmentScore * completedAssignments) /
          completedItems
        : 0;

    const student = await Student.findById(studentId);
    const classroomEnrollment = student?.classroomsEnrolled?.find(
      (c) => c.classroom?.toString() === classroomId,
    );

    const progressData = {
      totalQuizzes,
      completedQuizzes,
      totalAssignments,
      completedAssignments,
      averageQuizScore: Math.round(averageQuizScore),
      averageAssignmentScore: Math.round(averageAssignmentScore),
      overallAverage: Math.round(overallAverage),
      completionRate: Math.round(completionRate),
      totalItems,
      completedItems,
      classroomProgress: classroomEnrollment?.progress || 0,
    };

    return res.json({ success: true, data: progressData });
  } catch (err) {
    console.error("getStudentProgress error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getStudentClassrooms = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId).populate({
      path: "classroomsEnrolled.classroom",
      populate: {
        path: "instructor",
        select: "firstName lastName profilePicture",
      },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "Student not found" });
    }

    const classrooms = student.classroomsEnrolled.map((item) => ({
      ...item.classroom.toObject(),
      enrollmentDate: item.enrollmentDate,
      progress: item.progress,
    }));

    return res.json({ success: true, data: classrooms });
  } catch (err) {
    console.error("getStudentClassrooms error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getStudentPerformance = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user.id;

    const student = await Student.findById(studentId);

    const quizzes = await Quiz.find({
      classroom: classroomId,
      status: "published",
    });

    let totalPossiblePoints = 0;
    let totalEarnedPoints = 0;
    let quizScores = [];

    for (const quiz of quizzes) {
      const submission = quiz.submissions?.find(
        (s) => s.student?.toString() === studentId,
      );

      const maxPoints = quiz.questions?.length || 0;
      totalPossiblePoints += maxPoints;

      if (submission) {
        totalEarnedPoints += submission.score || 0;
        quizScores.push({
          title: quiz.title,
          score: submission.percentage || 0,
          completedAt: submission.submittedAt,
        });
      }
    }

    const overallPercentage =
      totalPossiblePoints > 0
        ? (totalEarnedPoints / totalPossiblePoints) * 100
        : 0;

    return res.json({
      success: true,
      data: {
        overallPercentage: Math.round(overallPercentage),
        totalQuizzes: quizzes.length,
        completedQuizzes: quizScores.length,
        quizScores,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
      },
    });
  } catch (err) {
    console.error("getStudentPerformance error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getClassLeaderboard = async (req, res) => {
  try {
    const { classroomId } = req.params;

    const students = await Student.find({
      "classroomsEnrolled.classroom": classroomId,
    }).select("firstName lastName profilePicture");

    const quizzes = await Quiz.find({
      classroom: classroomId,
      status: "published",
    });

    const assignments = await Assignment.find({
      classroom: classroomId,
    });

    const leaderboardData = await Promise.all(
      students.map(async (student) => {
        let totalScore = 0;
        let totalPossible = 0;
        let completedItems = 0;

        for (const quiz of quizzes) {
          const submission = quiz.submissions?.find(
            (s) => s.student?.toString() === student._id.toString(),
          );
          if (submission) {
            totalScore += submission.percentage || 0;
            totalPossible += 100;
            completedItems++;
          } else {
            totalPossible += 100;
          }
        }

        // Calculate assignment scores
        for (const assignment of assignments) {
          const submission = assignment.submissions?.find(
            (s) => s.student?.toString() === student._id.toString(),
          );
          if (submission) {
            const grade = submission.grade || submission.score || 0;
            totalScore += grade;
            totalPossible += 100;
            completedItems++;
          } else {
            totalPossible += 100;
          }
        }

        const overallPercentage =
          totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

        return {
          studentId: student._id,
          name: `${student.firstName} ${student.lastName}`,
          firstName: student.firstName,
          lastName: student.lastName,
          profilePicture: student.profilePicture,
          score: Math.round(overallPercentage),
          completedItems,
          totalItems: quizzes.length + assignments.length,
        };
      }),
    );

    leaderboardData.sort((a, b) => b.score - a.score);

    const rankedLeaderboard = leaderboardData.map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return res.json({ success: true, data: rankedLeaderboard });
  } catch (err) {
    console.error("getClassLeaderboard error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
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
  deleteLearningGoal,
};
