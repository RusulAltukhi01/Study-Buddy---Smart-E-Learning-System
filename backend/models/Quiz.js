const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ["mcq", "truefalse"], required: true },
  options: [optionSchema],
  hint: { type: String, default: "" },
  points: { type: Number, default: 1 },
});

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  answers: [{ questionIndex: Number, selectedOption: Number }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  timeTaken: { type: Number },
});

// const quizSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, default: "" },
//     instructor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Instructor",
//       required: true,
//     },
//     classroom: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Classroom",
//       default: null,
//     },
//     course: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       default: null,
//     },
//     questions: [questionSchema],
//     timeLimit: { type: Number, default: 10 },
//     maxAttempts: { type: Number, default: 1 },
//     status: {
//       type: String,
//       enum: ["draft", "published", "closed"],
//       default: "closed",
//     },
//     startDate: { type: Date, default: null },
//     dueDate: { type: Date, default: null },
//     sourceFiles: [
//       { name: String, url: String, mimeType: String, size: Number },
//     ],
//     submissions: [submissionSchema],
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Quiz", quizSchema);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      default: null,     
    },
    student: {            
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    isPersonal: { type: Boolean, default: false }, 


    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    questions: [questionSchema],
    timeLimit: { type: Number, default: 10 },
    maxAttempts: { type: Number, default: null },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    sourceFiles: [
      { name: String, url: String, mimeType: String, size: Number },
    ],
    submissions: [submissionSchema],
  },
  { timestamps: true },
);


quizSchema.path("instructor").validate(function () {
  return this.instructor || this.student;
}, "Quiz must belong to an instructor or a student")

module.exports = mongoose.model("Quiz", quizSchema);