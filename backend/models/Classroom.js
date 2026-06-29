const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [100, "Room name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },
    level: {
      type: String,
      trim: true,
    },
    accessCode: {
      type: String,
      unique: true,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      index: true,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    settings: {
      allowLateSubmissions: {
        type: Boolean,
        default: false,
      },
      autoGrade: {
        type: Boolean,
        default: false,
      },
      showGradesToStudents: {
        type: Boolean,
        default: false,
      },
      allowStudentDiscussion: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ["active", "archived", "ended"],
      default: "active",
    },
    maxStudents: {
      type: Number,
      min: 1,
      max: 3000,
    },
    coverImage: {
      type: String,
      default: null,
    },
    recentJoins: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        studentName: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// classroomSchema.pre('save', async function(next) {
//   if (!this.accessCode) {

//     const generateCode = () => {
//       return Math.random().toString(36).substring(2, 8).toUpperCase();
//     };

//     let code = generateCode();
//     let exists = await this.constructor.findOne({ accessCode: code });

//     // Ensure uniqueness
//     while (exists) {
//       code = generateCode();
//       exists = await this.constructor.findOne({ accessCode: code });
//     }

//     this.accessCode = code;
//   }
//   next();
// });

classroomSchema.virtual("studentCount").get(function () {
  return this.students?.length || 0;
});

classroomSchema.methods.isInstructor = function (userId) {
  return this.instructor.toString() === userId.toString();
};

classroomSchema.methods.isEnrolled = function (userId) {
  return this.students.some((id) => id.toString() === userId.toString());
};

classroomSchema.methods.addJoinRecord = async function (
  studentId,
  studentName,
) {
  this.recentJoins = this.recentJoins || [];
  this.recentJoins.push({
    studentId,
    studentName,
    joinedAt: new Date(),
  });

  if (this.recentJoins.length > 30) {
    this.recentJoins = this.recentJoins.slice(-30);
  }

  await this.save();
};

classroomSchema.set("toJSON", { virtuals: true });
classroomSchema.set("toObject", { virtuals: true });

classroomSchema.index({ instructor: 1, createdAt: -1 });
classroomSchema.index({ accessCode: 1 }, { unique: true });
classroomSchema.index({ students: 1 });

module.exports = mongoose.model("Classroom", classroomSchema);
