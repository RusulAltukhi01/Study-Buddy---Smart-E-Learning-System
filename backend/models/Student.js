const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [15, "Name cannot be more than 15 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name"],
      trim: true,
      maxlength: [15, "Name cannot be more than 15 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        "Please enter a valid phone number (e.g., +1234567890)",
      ],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    dateOfBirth: Date,

    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    otpCode: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },

    educationLevel: {
      type: String,
      enum: ["high_school", "bachelor", "master", "phd", "other"],
    },

    coursesEnrolled: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrollmentDate: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastAccessed: {
          type: Date,
          default: Date.now,
        },
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
          },
        ],
      },
    ],

    classroomsEnrolled: [
      {
        classroom: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Classroom",
        },
        enrollmentDate: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },

    institution: {
      type: String,
      default: "",
      trim: true,
    },

    fieldOfStudy: {
      type: String,
      default: "",
      trim: true,
    },

    graduationYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },

    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    isPublic: {
      type: Boolean,
      default: false,
    },

    showOnLeaderboard: {
      type: Boolean,
      default: true,
    },

    completedCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        grade: String,
        certificateUrl: String,
        finalScore: Number,
      },
    ],

    // Learning Progress
    learningGoals: [
      {
        goal: String,
        targetDate: Date,
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        achieved: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Achievements
    badges: [
      {
        badgeId: String,
        badgeName: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        iconUrl: String,
        category: String,
      },
    ],

    certificates: [
      {
        certificateId: String,
        courseName: String,
        issuedAt: {
          type: Date,
          default: Date.now,
        },
        downloadUrl: String,
        expiryDate: Date,
        issuer: String,
      },
    ],


    totalStudyHours: {
      type: Number,
      default: 0,
    },
    weeklyStudyHours: [
      {
        weekStart: Date,
        hours: Number,
      },
    ],


    wishlist: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        files: [{ name: String, url: String, size: Number, mimeType: String }],
        submittedAt: { type: Date, default: Date.now },

        score: { type: Number, default: null },
        feedback: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "graded", "late", "missing", "draft"],
          default: "pending",
        },
        gradedAt: { type: Date, default: null },
        gradedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Instructor",
          default: null,
        },
      },
    ],


    subscription: {
      type: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      startsAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: Date,
      autoRenew: {
        type: Boolean,
        default: false,
      },
      paymentMethod: String,
      lastPaymentDate: Date,
      nextPaymentDate: Date,
    },


    emailNotifications: {
      courseUpdates: { type: Boolean, default: true },
      newCourses: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
    },

    pushNotifications: {
      enabled: { type: Boolean, default: true },
      courseReminders: { type: Boolean, default: true },
      deadlineAlerts: { type: Boolean, default: true },
    },


    lastActive: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastLoginDate: Date,
    },


    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


studentSchema.pre("save", async function () {
  console.log("Pre-save middleware running for student:", this.email);

  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hash");
    return;
  }

  try {
    console.log("Hashing password for:", this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
  } catch (err) {
    console.error("Error hashing password:", err);
  }
});

studentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300, partialFilterExpression: { isVerified: false } },
);


studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.getSignedJwtToken = function () {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    {
      id: this._id,
      role: "student",
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" },
  );
};

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
