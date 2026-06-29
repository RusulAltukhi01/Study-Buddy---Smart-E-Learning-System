const Classroom = require("../models/Classroom");
const Student = require("../models/Student");
const Instructor = require("../models/Instructor");

const createClassroom = async (req, res) => {
  try {
    req.body.instructor = req.user.id;

    const instructor = await Instructor.findById(req.user.id);
    if (!instructor && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only instructors can create classrooms",
      });
    }

    if (!req.body.accessCode) {
      return res.status(400).json({
        success: false,
        error: "Access code is required",
      });
    }

    const existingClassroom = await Classroom.findOne({
      accessCode: req.body.accessCode,
    });

    if (existingClassroom) {
      return res.status(400).json({
        success: false,
        error: "Access code already exists. Please generate a new one.",
      });
    }

    req.body.accessCode = req.body.accessCode;

    const classroom = await Classroom.create(req.body);

    await classroom.populate(
      "instructor",
      "firstName lastName email profilePicture headline",
    );

    await Instructor.findByIdAndUpdate(req.user.id, {
      $push: { coursesCreated: classroom._id },
    });

    res.status(201).json({
      success: true,
      data: classroom,
    });
  } catch (error) {
    console.error("Create classroom error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error creating classroom",
    });
  }
};

const getMyClassrooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let query = {};

    if (userRole === "instructor") {
      query = { instructor: userId };
    } else if (userRole === "student") {
      query = { students: userId };
    } else {
      query = {
        $or: [{ instructor: userId }, { students: userId }],
      };
    }

    if (status) {
      query.status = status;
    }

    const classrooms = await Classroom.find(query)
      .populate(
        "instructor",
        "firstName lastName email profilePicture headline",
      )
      .populate("students", "firstName lastName email profilePicture")
      .sort("-createdAt");

    let teaching = [];
    let enrolled = [];

    if (userRole === "instructor") {
      teaching = classrooms;
    } else if (userRole === "student") {
      enrolled = classrooms;
    } else {
      teaching = classrooms.filter(
        (c) => c.instructor._id.toString() === userId,
      );
      enrolled = classrooms.filter(
        (c) =>
          c.instructor._id.toString() !== userId &&
          c.students.some((s) => s._id.toString() === userId),
      );
    }

    res.status(200).json({
      success: true,
      count: classrooms.length,
      data: {
        all: classrooms,
        teaching,
        enrolled,
      },
    });
  } catch (error) {
    console.error("Get my classrooms error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting classrooms",
    });
  }
};


const getClassroomById = async (req, res) => {
  try {
    console.log("========== DEBUG ==========");
    console.log("Requested Classroom ID:", req.params.id);
    console.log("User making request:", {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
    });

    const classroom = await Classroom.findById(req.params.id)
      .populate("instructor", "firstName lastName email profilePicture")
      .populate("students", "firstName lastName email profilePicture");

    if (!classroom) {
      console.log("Classroom not found in database");
      return res.status(404).json({
        success: false,
        error: "Classroom not found",
      });
    }

    console.log("Found classroom:", {
      id: classroom._id,
      name: classroom.name,
      instructorId: classroom.instructor._id.toString(),
      instructorEmail: classroom.instructor.email,
      studentCount: classroom.students.length,
      studentIds: classroom.students.map((s) => s._id.toString()),
    });

    const isInstructor =
      classroom.instructor._id.toString() === req.user.id.toString();
    const isEnrolled = classroom.students.some(
      (s) => s._id.toString() === req.user.id.toString(),
    );
    const isAdmin = req.user.role === "admin";

    console.log("Authorization check:", {
      isInstructor,
      isEnrolled,
      isAdmin,
      userRole: req.user.role,
    });

    if (!isInstructor && !isEnrolled && !isAdmin) {
      console.log("ACCESS DENIED - User not authorized");
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this classroom",
      });
    }

    console.log("ACCESS GRANTED");

    let stats = {};
    if (isInstructor || isAdmin) {
      stats = {
        totalStudents: classroom.students.length,
        activeToday: classroom.students.filter((s) => {
          return true; 
        }).length,
      };
    }

    res.status(200).json({
      success: true,
      data: classroom,
      stats,
      role: isInstructor ? "instructor" : isEnrolled ? "student" : "admin",
    });
  } catch (error) {
    console.error("Get classroom by id error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting classroom",
    });
  }
};

const updateClassroom = async (req, res) => {
  try {
    let classroom = await Classroom.findById(req.params.id);
    console.log("classroom.instructor:", classroom.instructor.toString());
    console.log("req.user.id:", req.user.id);
    console.log("Match?", classroom.instructor.toString() === req.user.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: "Classroom not found",
      });
    }

    if (
      classroom.instructor.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this classroom",
      });
    }

    if (req.body.accessCode && req.body.accessCode !== classroom.accessCode) {
      const existingCode = await Classroom.findOne({
        accessCode: req.body.accessCode,
        _id: { $ne: req.params.id },
      });

      if (existingCode) {
        return res.status(400).json({
          success: false,
          error: "Access code already in use",
        });
      }

      req.body.accessCode = req.body.accessCode;
    }

    classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("instructor", "firstName lastName email");

    res.status(200).json({
      success: true,
      data: classroom,
    });
  } catch (error) {
    console.error("Update classroom error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error updating classroom",
    });
  }
};

const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: "Classroom not found",
      });
    }

    if (
      classroom.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this classroom",
      });
    }

    if (req.query.permanent === "true" && req.user.role === "admin") {
      await Instructor.findByIdAndUpdate(classroom.instructor, {
        $pull: { coursesCreated: classroom._id },
      });

      await Student.updateMany(
        { _id: { $in: classroom.students } },
        { $pull: { coursesEnrolled: { course: classroom._id } } },
      );

      await classroom.remove();

      res.status(200).json({
        success: true,
        data: {},
      });
    } else {
      classroom.status = "archived";
      await classroom.save();

      res.status(200).json({
        success: true,
        data: classroom,
        message: "Classroom archived successfully",
      });
    }
  } catch (error) {
    console.error("Delete classroom error:", error);
    res.status(500).json({
      success: false,
      error: "Server error deleting classroom",
    });
  }
};

const joinClassroom = async (req, res) => {
  try {
    const { accessCode } = req.body;
    const studentId = req.user.id;
    
    const classroom = await Classroom.findOne({ accessCode });
    if (!classroom) {
      return res.status(404).json({ error: "Invalid access code" });
    }
    
 
    if (classroom.students.includes(studentId)) {
      return res.status(400).json({ error: "Already a member of this classroom" });
    }

  
    const student = await Student.findById(studentId).select("firstName lastName");
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    

    classroom.students.push(studentId);
    

    const studentName = `${student.firstName} ${student.lastName}`;
    await classroom.addJoinRecord(studentId, studentName);
    
    await classroom.save();
    
    return res.json({ 
      success: true, 
      message: "Successfully joined classroom",
      data: classroom 
    });
  } catch (error) {
    console.error("joinClassroom error:", error);
    return res.status(500).json({ error: "Failed to join classroom" });
  }
};

const leaveClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: "Classroom not found",
      });
    }

    if (classroom.instructor.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error:
          "Instructor cannot leave classroom. Archive or delete it instead.",
      });
    }

    if (!classroom.students.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: "You are not enrolled in this classroom",
      });
    }

    classroom.students = classroom.students.filter(
      (student) => student.toString() !== req.user.id,
    );

    await classroom.save();

    await Student.findByIdAndUpdate(req.user.id, {
      $pull: {
         classroomsEnrolled: { classroom: classroom._id },
      },
    });

    await Instructor.findByIdAndUpdate(classroom.instructor, {
      $inc: { totalStudents: -1 },
    });

    res.status(200).json({
      success: true,
      data: {},
      message: "Successfully left classroom",
    });
  } catch (error) {
    console.error("Leave classroom error:", error);
    res.status(500).json({
      success: false,
      error: "Server error leaving classroom",
    });
  }
};

const getInstructorClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({
      instructor: req.user.id,
      status: { $ne: "deleted" }
    }).select('_id name studentCount status createdAt');
    
    res.status(200).json({
      success: true,
      data: classrooms
    });
  } catch (error) {
    console.error("Error fetching instructor classrooms:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch instructor classrooms"
    });
  }
};

const getClassroomStudents = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the classroom
    const classroom = await Classroom.findById(id)
      .populate('students', 'firstName lastName email profilePicture lastActive enrollmentDate progress submissions');
    
    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: "Classroom not found"
      });
    }
    
    
    const Student = require('../models/Student');
    const studentIds = classroom.students.map(s => s._id);
    
    const students = await Student.find({
      _id: { $in: studentIds }
    })
    .populate('classroomsEnrolled.classroom', 'name description')
    .populate('coursesEnrolled.course', 'title')
    .select('firstName lastName email phoneNumber profilePicture lastActive enrollmentDate progress submissions classroomsEnrolled coursesEnrolled');
    
  
    const enrichedStudents = students.map(student => {
      const studentObj = student.toObject();
      
      
      studentObj.currentClassroom = {
        id: classroom._id,
        name: classroom.name
      };
      
      
      if (studentObj.classroomsEnrolled) {
        studentObj.classrooms = studentObj.classroomsEnrolled
          .filter(e => e.classroom && e.classroom.name)
          .map(e => e.classroom.name);
      }
      
      return studentObj;
    });
    
    res.status(200).json({
      success: true,
      count: enrichedStudents.length,
      students: enrichedStudents,
      classroom: {
        id: classroom._id,
        name: classroom.name
      }
    });
    
  } catch (error) {
    console.error("Get classroom students error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting students"
    });
  }
};

const archiveClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: "Classroom not found",
      });
    }

    if (
      classroom.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to archive this classroom",
      });
    }

    classroom.status = "archived";
    await classroom.save();

    res.status(200).json({
      success: true,
      data: classroom,
      message: "Classroom archived successfully",
    });
  } catch (error) {
    console.error("Archive classroom error:", error);
    res.status(500).json({
      success: false,
      error: "Server error archiving classroom",
    });
  }
};


const getRecentActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    console.log("Fetching recent activity for classroom:", id);
    console.log("Instructor ID:", instructorId);

    // Verify the instructor owns this classroom
    const classroom = await Classroom.findOne({
      _id: id,
      instructor: instructorId,
    });

    if (!classroom) {
      console.log("Classroom not found or unauthorized");
      return res.status(404).json({ 
        success: false, 
        error: "Classroom not found or you don't have access" 
      });
    }

    const Assignment = require("../models/Assignment");
    const activities = [];

    // Get assignments for this classroom
    const assignments = await Assignment.find({ classroom: id })
      .populate("submissions.student", "firstName lastName email")
      .sort({ updatedAt: -1 })
      .limit(10);

    console.log(`Found ${assignments.length} assignments`);

    
    assignments.forEach(assignment => {
      if (!assignment.submissions || assignment.submissions.length === 0) return;

      
      const recentSubmissions = [...assignment.submissions]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);

      recentSubmissions.forEach(submission => {
        const studentName = submission.student
          ? `${submission.student.firstName} ${submission.student.lastName}`
          : "A student";

       
        if (submission.submittedAt) {
          activities.push({
            id: `sub-${assignment._id}-${submission._id}`,
            type: "submit",
            name: studentName,
            action: `submitted`,
            link: assignment.title,
            linkLabel: assignment.title,
            detail: `"${assignment.title}"`,
            createdAt: submission.submittedAt,
          });
        }

        
        if (submission.status === "graded" && submission.gradedAt && submission.score !== null) {
          const percentage = (submission.score / assignment.points) * 100;
          activities.push({
            id: `grade-${assignment._id}-${submission._id}`,
            type: "grade",
            name: studentName,
            action: `received ${submission.score}/${assignment.points} (${Math.round(percentage)}%)`,
            detail: `on "${assignment.title}"`,
            tags: percentage >= 70 ? ["PASSED"] : percentage >= 50 ? ["NEEDS IMPROVEMENT"] : ["FAILED"],
            createdAt: submission.gradedAt,
          });
        }
      });
    });

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Return only the 15 most recent activities
    const recentActivities = activities.slice(0, 15);

    console.log(`Returning ${recentActivities.length} activities`);

    return res.json({
      success: true,
      data: recentActivities,
    });
  } catch (error) {
    console.error("getRecentActivity error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch recent activity",
      details: error.message,
    });
  }
};



const restoreClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: "Classroom not found",
      });
    }

    if (
      classroom.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to restore this classroom",
      });
    }

    classroom.status = "active";
    await classroom.save();

    res.status(200).json({
      success: true,
      data: classroom,
      message: "Classroom restored successfully",
    });
  } catch (error) {
    console.error("Restore classroom error:", error);
    res.status(500).json({
      success: false,
      error: "Server error restoring classroom",
    });
  }
};

const getClassroomAnalytics = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id).populate({
      path: "students",
      select: "lastActive coursesEnrolled totalStudyHours streak",
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: "Classroom not found",
      });
    }

    if (
      classroom.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view analytics",
      });
    }

    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setDate(now.getDate() - 30));

    const analytics = {
      overview: {
        totalStudents: classroom.students.length,
        activeLastWeek: classroom.students.filter((s) => s.lastActive > weekAgo)
          .length,
        activeLastMonth: classroom.students.filter(
          (s) => s.lastActive > monthAgo,
        ).length,
        averageProgress:
          classroom.students.reduce((acc, s) => {
            const enrollment = s.coursesEnrolled?.find(
              (e) => e.course?.toString() === req.params.id,
            );
            return acc + (enrollment?.progress || 0);
          }, 0) / classroom.students.length || 0,
      },
      engagement: {
        totalStudyHours: classroom.students.reduce(
          (acc, s) => acc + (s.totalStudyHours || 0),
          0,
        ),
        averageStreak:
          classroom.students.reduce(
            (acc, s) => acc + (s.streak?.current || 0),
            0,
          ) / classroom.students.length || 0,
        longestStreak: Math.max(
          ...classroom.students.map((s) => s.streak?.longest || 0),
        ),
      },
      createdAt: classroom.createdAt,
      status: classroom.status,
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get classroom analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting analytics",
    });
  }
};

module.exports = {
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
};
