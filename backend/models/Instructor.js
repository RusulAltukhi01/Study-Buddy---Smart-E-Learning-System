const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const instructorSchema = new mongoose.Schema(
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

    headline: {
      type: String,
      required: [true, "Headline is required for instructors"],
      trim: true,
      maxlength: [100, "Headline cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      required: [true, "Bio is required for instructors"],
      minlength: [50, "Bio must be at least 50 characters"],
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },

    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
      youtube: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },

    expertise: [
      {
        type: String,
        trim: true,
      },
    ],

    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
        certificateUrl: String,
        description: String,
      },
    ],

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    previousRoles: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
        achievements: [String],
      },
    ],

    coursesCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    otpCode: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },

    totalStudents: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    coursesPublished: {
      type: Number,
      default: 0,
    },
    totalCourseHours: {
      type: Number,
      default: 0,
    },

    payoutMethod: {
      type: {
        type: String,
        enum: ["paypal", "bank_transfer", "stripe", null],
        default: null,
      },
      email: String,
      accountNumber: String,
      bankName: String,
      accountHolderName: String,
      routingNumber: String,
      swiftCode: String,
    },

    earnings: {
      total: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      lastPayoutDate: Date,
      nextPayoutDate: Date,
      pendingPayoutAmount: { type: Number, default: 0 },
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "suspended"],
      default: "pending",
    },

    verificationDocuments: [
      {
        documentType: {
          type: String,
          enum: [
            "id_card",
            "passport",
            "degree_certificate",
            "portfolio",
            "other",
          ],
        },
        documentUrl: String,
        uploadedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        reviewedAt: Date,
        notes: String,
      },
    ],

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    instructorSince: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    profileViews: {
      type: Number,
      default: 0,
    },

    emailNotifications: {
      newStudent: { type: Boolean, default: true },
      courseReview: { type: Boolean, default: true },
      payout: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      platformUpdates: { type: Boolean, default: true },
    },

    stripeAccountId: String,
    stripeAccountStatus: String,

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,

    availability: {
      type: String,
      enum: ["available", "busy", "away"],
      default: "available",
    },
    responseTime: {
      type: Number,
      default: 24,
    },
    teachingStyle: [String],
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

instructorSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    console.error("Error hashing password:", err);
  }
});

instructorSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

instructorSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300, partialFilterExpression: { isVerified: false } }
);

instructorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

instructorSchema.methods.getSignedJwtToken = function () {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    {
      id: this._id,
      role: "instructor",
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" },
  );
};

const Instructor = mongoose.model("Instructor", instructorSchema);
module.exports = Instructor;
