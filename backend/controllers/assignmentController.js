const Assignment = require("../models/Assignment");
const Instructor = require("../models/Instructor");
const Classroom = require("../models/Classroom");
const Student = require("../models/Student");
const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");
const { sendBulkNotifications } = require("../utils/sendNotification");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/assignments/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB per file
}).array("files", 5); // max 5 files per request

function parseFormData(req) {
  if (req.body?.data) {
    try {
      return JSON.parse(req.body.data);
    } catch {
      return req.body;
    }
  }
  return req.body;
}

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      submissionType,
      points,
      autoCorrect,
      isDraft,
      classroomId,
    } = parseFormData(req);

    if (!title?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    const attachedFiles = (req.files || []).map((f) => ({
      name: f.originalname,
      url: `/uploads/assignments/${f.filename}`,
      size: f.size,
      mimeType: f.mimetype,
    }));

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description || "",
      dueDate: dueDate || null,
      submissionType: submissionType || "file",
      points: points ?? 100,
      autoCorrect: autoCorrect ?? false,
      isDraft: isDraft ?? false,
      instructor: req.user.id,
      classroom: classroomId || null,
      attachedFiles,
    });

    const io = req.app.get("io");
    const classroom = classroomId
      ? await Classroom.findById(classroomId).populate("students")
      : null;

    if (classroom && classroom.students.length > 0) {
      await sendBulkNotifications(
        classroom.students,
        "Student",
        {
          type: "assignment_posted",
          title: `New Assignment: ${title}`,
          message: `Due: ${dueDate ? new Date(dueDate).toLocaleDateString() : "No deadline"}. Total points: ${points}`,
          link: `/student/classrooms/${classroomId}/assignments`,
          action: {
            type: "navigate",
            params: {
              route: "STUDENT_CLASSROOM_ASSIGNMENTS",
              metadata: { classroomId, assignmentId: assignment._id },
            },
          },
          metadata: {
            classroomId,
            assignmentId: assignment._id,
            dueDate,
            totalPoints: points,
          },
        },
        io,
      );
    }

    return res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    console.error("createAssignment error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, error: messages.join(", ") });
    }
    return res
      .status(500)
      .json({ success: false, error: "Server error creating assignment" });
  }
};

const getAssignments = async (req, res) => {
  try {
    const {
      classroomId,
      isDraft,
      submissionType,
      page = 1,
      limit = 20,
    } = req.query;

    const instructorId = req.user._id ?? req.user.id;

    console.log("=== getAssignments DEBUG ===");
    console.log("instructorId:", instructorId);
    console.log("classroomId from query:", classroomId);

 
    const allForInstructor = await Assignment.find({
      instructor: instructorId,
    });
    console.log(
      "All assignments for this instructor:",
      allForInstructor.map((a) => ({
        id: a._id,
        title: a.title,
        classroom: a.classroom,
        instructor: a.instructor,
      })),
    );

    const filter = { instructor: instructorId };
    if (classroomId) filter.classroom = classroomId;
    if (isDraft !== undefined) filter.isDraft = isDraft === "true";
    if (submissionType) filter.submissionType = submissionType;

    console.log("Final filter:", filter);

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate("classroom", "name students"),
      Assignment.countDocuments(filter),
    ]);

    console.log("Found assignments count:", assignments.length);
    console.log("===========================");


    return res.json({
      success: true,
      data: assignments.map((a) => {
        const obj = a.toObject();
        return {
          ...obj,
          
          attachedFiles: obj.attachedFiles || [],
          
          totalStudents: a.classroom?.students?.length ?? 0,
         
          submittedCount: obj.submissions?.length ?? 0,
        };
      }),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAssignments error:", error.message, error.stack);
    return res
      .status(500)
      .json({ success: false, error: "Server error fetching assignments" });
  }
};
const getStudentAssignments = async (req, res) => {
  try {
    const { classroomId } = req.query;
    const studentId = req.user.id;

    let classroomFilter = {};
    if (classroomId) {
      classroomFilter = { _id: classroomId };
    } else {
      const classrooms = await Classroom.find({ students: studentId }).select(
        "_id",
      );
      const classroomIds = classrooms.map((c) => c._id);
      classroomFilter = { classroom: { $in: classroomIds } };
    }

    const filter = {
      isDraft: false,
      ...(classroomId ? { classroom: classroomId } : classroomFilter),
    };

    const assignments = await Assignment.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .populate("classroom", "name")
      .populate("instructor", "firstName lastName");

    const data = assignments.map((a) => {
      const obj = a.toObject();
      const studentSubs = (a.submissions || []).filter(
        (s) => s.student?.toString() === studentId.toString(),
      );

      const submission = studentSubs[0];
      const isSubmitted = studentSubs.length > 0;

      return {
        ...obj,
        submissionStatus: isSubmitted ? "submitted" : "pending",
        submittedAt: submission?.submittedAt || null,

        grade: submission?.score || null,
        gradeStatus: submission?.status || null,
        feedback: submission?.feedback || null,
        gradedAt: submission?.gradedAt || null,
        submissions: undefined,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error("getStudentAssignments error:", error.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      instructor: req.user.id,
    })
      .populate("course", "title thumbnail")
      .lean();

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }

    
    if (assignment.submissions && assignment.submissions.length > 0) {
      const studentIds = assignment.submissions.map((s) => s.student);
      const students = await Student.find({ _id: { $in: studentIds } }).select(
        "firstName lastName email profilePicture",
      );

      const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

      assignment.submissions = assignment.submissions.map((sub) => ({
        ...sub,
        student: studentMap.get(sub.student.toString()) || sub.student,
      }));
    }

    console.log("Returning assignment with submissions:", {
      assignmentId: assignment._id,
      submissionsCount: assignment.submissions?.length,
      sampleSubmission: assignment.submissions?.[0]
        ? {
            hasScore: "score" in assignment.submissions[0],
            score: assignment.submissions[0].score,
            hasFeedback: "feedback" in assignment.submissions[0],
            status: assignment.submissions[0].status,
          }
        : null,
    });

    return res.json({ success: true, data: assignment });
  } catch (error) {
    console.error("getAssignmentById error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error fetching assignment" });
  }
};
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      instructor: req.user.id,
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }

    const {
      title,
      description,
      dueDate,
      submissionType,
      points,
      autoCorrect,
      isDraft,
    } = parseFormData(req);

    const newFiles = (req.files || []).map((f) => ({
      name: f.originalname,
      url: `/uploads/assignments/${f.filename}`,
      size: f.size,
      mimeType: f.mimetype,
    }));

    if (title !== undefined) assignment.title = title.trim();
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate || null;
    if (submissionType !== undefined)
      assignment.submissionType = submissionType;
    if (points !== undefined) assignment.points = points;
    if (autoCorrect !== undefined) assignment.autoCorrect = autoCorrect;
    if (isDraft !== undefined) assignment.isDraft = isDraft;
    if (newFiles.length) assignment.attachedFiles.push(...newFiles);

    await assignment.save();

    return res.json({ success: true, data: assignment });
  } catch (error) {
    console.error("updateAssignment error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, error: messages.join(", ") });
    }
    return res
      .status(500)
      .json({ success: false, error: "Server error updating assignment" });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user.id,
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }

    return res.json({ success: true, message: "Assignment deleted" });
  } catch (error) {
    console.error("deleteAssignment error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error deleting assignment" });
  }
};

const removeAttachedFile = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      instructor: req.user.id,
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }

    assignment.attachedFiles = assignment.attachedFiles.filter(
      (f) => f._id.toString() !== req.params.fileId,
    );

    await assignment.save();

    return res.json({ success: true, data: assignment });
  } catch (error) {
    console.error("removeAttachedFile error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error removing file" });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }

    const studentId = req.user.id;
    console.log("StudentId from submission", studentId);

    const submittedFiles = (req.files || []).map((f) => ({
      name: f.originalname,
      url: `/uploads/assignments/${f.filename}`,
      size: f.size,
      mimeType: f.mimetype,
    }));

    if (submittedFiles.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload at least one file" });
    }

    const existingIndex = assignment.submissions?.findIndex(
      (s) => s.student?.toString() === studentId.toString(),
    );

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex].files = submittedFiles;
      assignment.submissions[existingIndex].submittedAt = new Date();
    } else {
      if (!assignment.submissions) assignment.submissions = [];
      assignment.submissions.push({
        student: studentId,
        files: submittedFiles,
        submittedAt: new Date(),
      });
    }

    await assignment.save();
    return res.json({ success: true, data: assignment });
  } catch (error) {
    console.error("submitAssignment error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Server error submitting assignment" });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { score, feedback, status } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const submission = assignment.submissions.find(
      (s) => s.student.toString() === studentId,
    );

    if (!submission) {
      return res
        .status(404)
        .json({ error: "No submission found for this student" });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = status || "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await assignment.save();

    await Student.findOneAndUpdate(
      {
        _id: studentId,
        "submissions.assignment": assignmentId,
      },
      {
        $set: {
          "submissions.$.score": score,
          "submissions.$.feedback": feedback,
          "submissions.$.status": status || "graded",
          "submissions.$.gradedAt": new Date(),
        },
      },
    );

    const io = req.app.get("io");
    const student = await Student.findById(studentId);
    const instructor = await Instructor.findById(req.user.id);

    const percentage = assignment.maxScore
      ? ((score / assignment.maxScore) * 100).toFixed(1)
      : null;

    let message = `Your submission for "${assignment.title}" has been graded.`;
    if (score !== undefined) {
      message = `You received ${score}${assignment.maxScore ? `/${assignment.maxScore}` : ""} points${percentage ? ` (${percentage}%)` : ""} on "${assignment.title}".`;
    }
    if (feedback) {
      message += ` Feedback: ${feedback.substring(0, 100)}${feedback.length > 100 ? "..." : ""}`;
    }

    const notification = await Notification.create({
      recipient: studentId,
      recipientModel: "Student",
      type: "assignment_graded",
      title: `Assignment Graded: ${assignment.title}`,
      message: message,
      link: `/student/classrooms/${assignment.classroomId}/assignments/${assignmentId}`,
      action: {
        type: "navigate",
        params: {
          route: "STUDENT_CLASSROOM_ASSIGNMENTS",
          metadata: {
            classroomId: assignment.classroomId,
            assignmentId: assignmentId,
          },
        },
      },
      metadata: {
        classroomId: assignment.classroomId,
        assignmentId: assignmentId,
        score: score,
        maxScore: assignment.maxScore,
        percentage: percentage,
        hasFeedback: !!feedback,
        gradedBy: `${instructor.firstName} ${instructor.lastName}`,
      },
    });

    if (io) {
      io.to(`user:${studentId}`).emit("notification", notification);
      // console.log(`Grade notification sent to student: ${studentId}`);
    }

    res.json({
      success: true,
      message: "Grade saved successfully",
      submission,
    });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({ error: "Failed to grade submission" });
  }
};

const getMyGrade = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    const assignment = await Assignment.findById(assignmentId)
      .select("title description points dueDate submissions")
      .populate("classroom", "name");

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const submission = assignment.submissions.find(
      (s) => s.student.toString() === studentId,
    );

    if (!submission) {
      return res.json({
        success: true,
        hasGrade: false,
        message: "No submission found",
      });
    }

    res.json({
      success: true,
      hasGrade: true,
      grade: {
        score: submission.score,
        maxScore: assignment.points,
        percentage: submission.score
          ? (submission.score / assignment.points) * 100
          : 0,
        feedback: submission.feedback,
        status: submission.status,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      },
      assignment: {
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
      },
    });
  } catch (error) {
    console.error("Get grade error:", error);
    res.status(500).json({ error: "Failed to fetch grade" });
  }
};

const getMyGrades = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user.id;

    const assignments = await Assignment.find({ classroom: classroomId })
      .select("title points dueDate submissions")
      .sort("dueDate");

    const grades = assignments.map((assignment) => {
      const submission = assignment.submissions.find(
        (s) => s.student.toString() === studentId,
      );

      return {
        assignmentId: assignment._id,
        title: assignment.title,
        maxScore: assignment.points,
        score: submission?.score || null,
        percentage: submission?.score
          ? (submission.score / assignment.points) * 100
          : null,
        status: submission?.status || "not_submitted",
        submittedAt: submission?.submittedAt,
        gradedAt: submission?.gradedAt,
      };
    });

    res.json({
      success: true,
      grades,
    });
  } catch (error) {
    console.error("Get grades error:", error);
    res.status(500).json({ error: "Failed to fetch grades" });
  }
};

module.exports = {
  upload,
  createAssignment,
  getAssignments,
  getStudentAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  removeAttachedFile,
  submitAssignment,
  gradeSubmission,
  getMyGrade,
  getMyGrades,
};
