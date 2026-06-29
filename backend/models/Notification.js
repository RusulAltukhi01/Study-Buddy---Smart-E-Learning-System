const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "quiz_opened",
        "quiz_graded",
        "assignment_posted",
        "assignment_graded",
        "assignment_deadline",
        "announcement",
        "course_update",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    action: {
      type: {
        type: String,
        enum: ["navigate", "openModal", "externalLink", "reload"],
      },
      params: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    metadata: { type: Object, default: {} },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
