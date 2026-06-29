const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    submissionType: {
      type: String,
      enum: ["file", "text", "link", "video"],
      default: "file",
    },
    points: {
      type: Number,
      default: 100,
      min: [0, "Points cannot be negative"],
    },
    autoCorrect: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },

    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      default: null,
    },
    attachedFiles: [
      {
        name: { type: String },
        url: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],

    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        files: [{ name: String, url: String, size: Number, mimeType: String }],
        submittedAt: { type: Date, default: Date.now },
        
        
        score: {
          type: Number,
          default: null,
          min: 0,
        },
        feedback: {
          type: String,
          default: "",
        },
        status: {
          type: String,
          enum: ["pending", "graded", "late", "missing", "draft"],
          default: "pending",
        },
        gradedAt: {
          type: Date,
          default: null,
        },
        gradedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Instructor",
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);