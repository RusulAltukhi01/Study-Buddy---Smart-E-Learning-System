const Quiz = require("../models/Quiz");
const Classroom = require("../models/Classroom");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendBulkNotifications } = require("../utils/sendNotification");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/quizzes/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).array("files", 10);

function generateFakeQuestions(count = 5) {
  const mcqPool = [
    {
      text: "Which data structure uses LIFO order?",
      type: "mcq",
      options: [
        { text: "Queue", isCorrect: false },
        { text: "Stack", isCorrect: true },
        { text: "Linked List", isCorrect: false },
        { text: "Tree", isCorrect: false },
      ],
      hint: "Think about how a stack of plates works.",
      points: 1,
    },
    {
      text: "What does CPU stand for?",
      type: "mcq",
      options: [
        { text: "Central Processing Unit", isCorrect: true },
        { text: "Computer Personal Unit", isCorrect: false },
        { text: "Central Program Utility", isCorrect: false },
        { text: "Core Processing Utility", isCorrect: false },
      ],
      hint: "It is the brain of the computer.",
      points: 1,
    },
    {
      text: "Which sorting algorithm has O(n log n) average time complexity?",
      type: "mcq",
      options: [
        { text: "Bubble Sort", isCorrect: false },
        { text: "Selection Sort", isCorrect: false },
        { text: "Merge Sort", isCorrect: true },
        { text: "Insertion Sort", isCorrect: false },
      ],
      hint: "It uses a divide and conquer approach.",
      points: 1,
    },
    {
      text: "What is the primary purpose of an operating system?",
      type: "mcq",
      options: [
        { text: "To run web browsers", isCorrect: false },
        { text: "To manage hardware and software resources", isCorrect: true },
        { text: "To provide internet access", isCorrect: false },
        { text: "To store user files", isCorrect: false },
      ],
      hint: "Think about what manages all programs running on a computer.",
      points: 1,
    },
    {
      text: "Which protocol is used to send emails?",
      type: "mcq",
      options: [
        { text: "HTTP", isCorrect: false },
        { text: "FTP", isCorrect: false },
        { text: "SMTP", isCorrect: true },
        { text: "SSH", isCorrect: false },
      ],
      hint: "It stands for Simple Mail Transfer Protocol.",
      points: 1,
    },
  ];

  const tfPool = [
    {
      text: "RAM is a type of non-volatile memory.",
      type: "truefalse",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
      hint: "RAM loses data when power is off.",
      points: 1,
    },
    {
      text: "HTML is a programming language.",
      type: "truefalse",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
      hint: "HTML is a markup language, not a programming language.",
      points: 1,
    },
    {
      text: "A binary tree can have at most 2 children per node.",
      type: "truefalse",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
      hint: "The word 'binary' means two.",
      points: 1,
    },
    {
      text: "IPv6 addresses are 32 bits long.",
      type: "truefalse",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
      hint: "IPv4 is 32 bits. IPv6 is much longer.",
      points: 1,
    },
    {
      text: "JavaScript is single-threaded.",
      type: "truefalse",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
      hint: "It uses an event loop to handle async operations.",
      points: 1,
    },
  ];

  const all = [...mcqPool, ...tfPool];
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getCurrentQuizStatus(quiz) {
  const now = new Date();
  if (quiz.status === "draft") return "draft";

  const start = quiz.startDate ? new Date(quiz.startDate) : null;
  const due = quiz.dueDate ? new Date(quiz.dueDate) : null;

  if (start && start > now) return "scheduled";
  if (due && due < now) return "closed";
  return "opened";
}


const createPersonalQuiz = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { title, timeLimit, questions } = req.body;

    if (!title?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    let parsedQuestions;
    try {
      parsedQuestions =
        typeof questions === "string" ? JSON.parse(questions) : questions;
    } catch {
      return res
        .status(400)
        .json({ success: false, error: "Invalid questions format" });
    }

    if (!parsedQuestions || parsedQuestions.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Questions are required" });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      student: studentId,
      instructor: null,
      classroom: null,
      isPersonal: true,
      questions: parsedQuestions,
      timeLimit: Number(timeLimit) || 30,
      status: "published",
    });

    const io = req.app.get('io');
    const classroom = await Classroom.findById(quiz.classroomId).populate('students');
    

    if (classroom && classroom.students.length > 0) {
      await sendBulkNotifications(
        classroom.students,
        'Student',
        {
          type: 'quiz_opened',
          title: `Quiz Available: ${quiz.title}`,
          message: `Duration: ${quiz.duration} minutes. Good luck!`,
          link: `/student/classrooms/${quiz.classroomId}/quizzes`,
          action: {
            type: 'navigate',
            params: {
              route: 'STUDENT_CLASSROOM_QUIZZES',
              metadata: { classroomId: quiz.classroomId, quizId: quiz._id }
            }
          },
          metadata: { classroomId: quiz.classroomId, quizId: quiz._id, duration: quiz.duration }
        },
        io
      );
    }

    return res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    console.error("createPersonalQuiz error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const createQuiz = async (req, res) => {
  // create quiz by instructor
  console.log("createQuiz body:", req.body);
  console.log("createQuiz files:", req.files);
  try {
    const {
      title,
      description,
      classroomId,
      courseId,
      timeLimit,
      maxAttempts,
      startDate,
      dueDate,
      questionCount,
    } = req.body;
    const status = req.body.status || "draft";

    if (!title?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    const sourceFiles = (req.files || []).map((f) => ({
      name: f.originalname,
      url: `/uploads/quizzes/${f.filename}`,
      mimeType: f.mimetype,
      size: f.size,
    }));

    let questions;
    if (req.body.questions) {
      try {
        questions =
          typeof req.body.questions === "string"
            ? JSON.parse(req.body.questions)
            : req.body.questions;
      } catch {
        questions = generateFakeQuestions(parseInt(questionCount) || 5);
      }
    } else {
      questions = generateFakeQuestions(parseInt(questionCount) || 5);
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      description: description || "",
      instructor: req.user.id,
      classroom: classroomId || null,
      course: courseId || null,
      timeLimit: parseInt(timeLimit) || 10,
      maxAttempts: parseInt(maxAttempts) || 1,
      startDate: startDate || null,
      dueDate: dueDate || null,
      sourceFiles,
      questions,
      status,
    });

    return res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    console.error("createQuiz error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Server error creating quiz" });
  }
};

const getQuizzes = async (req, res) => {
  // the quizzes that created by the instructor
  try {
    const { classroomId, courseId, status } = req.query;
    const filter = { instructor: req.user.id };
    if (classroomId) filter.classroom = classroomId;
    if (courseId) filter.course = courseId;
    if (status) filter.status = status;

    const quizzes = await Quiz.find(filter)
      .select("-questions.options.isCorrect")
      .populate("classroom", "name")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    const result = quizzes.map((q) => ({
      ...q.toObject(),
      currentStatus: getCurrentQuizStatus(q),
      currentStatus: getCurrentQuizStatus(q),
      submissionCount: q.submissions?.length || 0,
      submissions: undefined,
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("getQuizzes error:", err.message, err.stack);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getMyPersonalQuizzes = async (req, res) => {
  try {
    const studentId = req.user.id;

    const quizzes = await Quiz.find({
      student: studentId,
      isPersonal: true,
    })
      .select("title questions timeLimit submissions createdAt")
      .sort({ createdAt: -1 });

    const enriched = quizzes.map((q) => {
      const mySubmission = q.submissions.find(
        (s) => s.student.toString() === studentId.toString(),
      );
      return {
        ...q.toObject(),
        hasSubmitted: !!mySubmission,
        lastScore: mySubmission?.percentage ?? null,
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const getStudentQuizzes = async (req, res) => {
  try {
    const { classroomId } = req.query;
    const studentId = req.user.id;

    let filter = { status: "published" };

    if (classroomId) {
      filter.classroom = classroomId;
    } else {
      const classrooms = await Classroom.find({ students: studentId }).select(
        "_id",
      );
      console.log("found classrooms:", classrooms);
      filter.classroom = { $in: classrooms.map((c) => c._id) };
    }

    console.log("quiz filter:", filter);

    const quizzes = await Quiz.find(filter)
      .populate("classroom", "name")
      .sort({ createdAt: -1 })
      .lean();

    console.log("quizzes found:", quizzes.length);
    const result = quizzes.map((q) => {
      const studentSubs = (q.submissions || []).filter(
        (s) => s.student?.toString() === studentId.toString(),
      );
      return {
        ...q,
        currentStatus: getCurrentQuizStatus(q),
        attemptsMade: studentSubs.length,
        hasSubmitted: studentSubs.length >= q.maxAttempts,
        lastScore: studentSubs.at(-1)?.percentage ?? null,
        submissions: undefined,
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("getStudentQuizzes error:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("classroom", "name")
      .populate("course", "title")
      .populate("submissions.student", "firstName lastName email");

    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

 
    if (quiz.isPersonal) {
     
      if (quiz.student.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      
      const studentSubmissions = quiz.submissions.filter(
        (s) => s.student?.toString() === req.user.id.toString(),
      );

      const hasSubmitted = studentSubmissions.length > 0;
      const attemptsMade = studentSubmissions.length;
      const lastScore =
        studentSubmissions[studentSubmissions.length - 1]?.percentage ?? null;

      
      const quizObj = quiz.toObject();

      const responseData = {
        ...quizObj,
        hasSubmitted: hasSubmitted,
        attemptsMade: attemptsMade,
        lastScore: lastScore,
        maxAttempts: quiz.maxAttempts || 999, // Unlimited for personal quizzes
        submissions: undefined, 
      };

      return res.json({ success: true, data: responseData });
    }

    
    const isInstructor = req.user.role === "instructor";

    if (!isInstructor) {
      const studentSubmissions = quiz.submissions.filter(
        (s) => s.student?._id?.toString() === req.user.id.toString(),
      );

      const quizObj = quiz.toObject();

      
      quizObj.questions = quizObj.questions.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ _id: o._id, text: o.text })),
      }));

      quizObj.hasSubmitted = studentSubmissions.length >= quiz.maxAttempts;
      quizObj.attemptsMade = studentSubmissions.length;
      quizObj.lastScore = studentSubmissions.at(-1)?.percentage ?? null;
      quizObj.submissions = undefined;

      return res.json({ success: true, data: quizObj });
    }

   
    return res.json({ success: true, data: quiz });
  } catch (err) {
    console.error("getQuizById error:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user.id },
      { status: "published" },
      { new: true },
    );
    if (!quiz)
      return res.status(404).json({ success: false, error: "Quiz not found" });
    return res.json({ success: true, data: quiz });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    if (quiz.status !== "published") {
      return res
        .status(400)
        .json({ success: false, error: "Quiz is not available" });
    }

    const studentId = req.user.id;
    const existingSubmissions = quiz.submissions.filter(
      (s) => s.student.toString() === studentId,
    );

    
    if (!quiz.isPersonal && existingSubmissions.length >= quiz.maxAttempts) {
      return res
        .status(400)
        .json({ success: false, error: "Maximum attempts reached" });
    }

    let score = 0;
    let totalPoints = 0;

    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (!question) return answer;
      totalPoints += question.points || 1;
      const selectedOption = question.options[answer.selectedOption];
      if (selectedOption?.isCorrect) score += question.points || 1;
      return answer;
    });

    const percentage =
      totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    quiz.submissions.push({
      student: studentId,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
      timeTaken,
    });

    await quiz.save();

    const resultQuestions = quiz.questions.map((q, qi) => {
      const studentAnswer = gradedAnswers.find((a) => a.questionIndex === qi);
      return {
        text: q.text,
        type: q.type,
        options: q.options.map((o, oi) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          selected: studentAnswer?.selectedOption === oi,
        })),
        hint: q.hint,
      };
    });

 
    const attemptsLeft = quiz.isPersonal
      ? 999 
      : Math.max(0, quiz.maxAttempts - existingSubmissions.length - 1);

    return res.json({
      success: true,
      data: {
        score,
        totalPoints,
        percentage,
        questions: resultQuestions,
        attemptNumber: existingSubmissions.length + 1,
        attemptsLeft: attemptsLeft,
      },
    });
  } catch (err) {
    console.error("submitQuiz error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const updateQuiz = async (req, res) => {
  try {
    console.log("updateQuiz called for id:", req.params.id);
    console.log("user id:", req.user.id);
    console.log("body keys:", Object.keys(req.body));

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const {
      title,
      timeLimit,
      maxAttempts,
      startDate,
      dueDate,
      status,
      classroomId,
      questions,
      shuffle,
    } = req.body;

    if (title) quiz.title = title;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (maxAttempts) quiz.maxAttempts = maxAttempts;
    if (startDate) quiz.startDate = startDate;
    if (dueDate) quiz.dueDate = dueDate;
    if (status) quiz.status = status;
    if (classroomId) quiz.classroom = classroomId;
    if (shuffle !== undefined) quiz.shuffle = shuffle;

    if (questions) {
      try {
        const parsed =
          typeof questions === "string"
            ? JSON.parse(questions.replace(/^`|`$/g, "").trim())
            : questions;
        quiz.questions = parsed;
        // console.log("Questions parsed:", parsed.length);
      } catch (parseErr) {
        console.error("Failed to parse questions:", parseErr.message);
        return res.status(400).json({ error: "Invalid questions format" });
      }
    }

    const updated = await quiz.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateQuiz error:", err.message);
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user.id,
    });
    if (!quiz)
      return res.status(404).json({ success: false, error: "Quiz not found" });
    return res.json({ success: true, message: "Quiz deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const getClassroomQuizzesForStudent = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user.id;

    console.log("studentId from token:", studentId);

    const quizzes = await Quiz.find({
      classroom: classroomId,
      status: { $in: ["published", "closed"] },
    })
      .select(
        "title description timeLimit maxAttempts startDate dueDate status questions submissions",
      )
      .sort({ createdAt: -1 })
      .lean();
    const result = quizzes.map((q) => {
      console.log(
        "all submission student IDs:",
        q.submissions.map((s) => s.student.toString()),
      );
      console.log("comparing with studentId:", studentId);
      const studentSubmissions = q.submissions.filter(
        (s) => s.student.toString() === req.user.id.toString(),
      );
      console.log("matched submissions:", studentSubmissions.length);
      return {
        ...q,
        currentStatus: getCurrentQuizStatus(q),
        attemptsMade: studentSubmissions.length,
        hasSubmitted: studentSubmissions.length >= q.maxAttempts,
        lastScore: studentSubmissions.at(-1)?.percentage ?? null,
        submissions: undefined,
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("getClassroomQuizzesForStudent error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
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
};
