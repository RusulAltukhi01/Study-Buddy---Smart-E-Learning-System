const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    
   
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    
  
    transactionId: String,
    paymentMethod: String,
    amountPaid: Number,
    currency: {
      type: String,
      default: "USD",
    },
    
   
    accessExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    
    
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLectures: [
      {
        lectureId: mongoose.Schema.Types.ObjectId,
        completedAt: Date,
        timeSpent: Number, // in minutes
      },
    ],
    
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    }, // in minutes
    
    
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    
   
    notes: [
      {
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        lectureId: mongoose.Schema.Types.ObjectId,
      },
    ],
    
   
    bookmarks: [
      {
        lectureId: mongoose.Schema.Types.ObjectId,
        timestamp: Number, // video timestamp in seconds
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });


enrollmentSchema.index({ student: 1, enrolledAt: -1 });
enrollmentSchema.index({ course: 1, enrolledAt: -1 });
enrollmentSchema.index({ completed: 1 });
enrollmentSchema.index({ lastAccessed: -1 });


enrollmentSchema.virtual("completionRate").get(function () {
  if (this.course?.totalLectures) {
    return (this.completedLectures.length / this.course.totalLectures) * 100;
  }
  return 0;
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;