const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        originalName: { type: String },
        storedName: { type: String },
        url: { type: String },
        mimetype: { type: String },
        size: { type: Number },
      },
    ],

    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);