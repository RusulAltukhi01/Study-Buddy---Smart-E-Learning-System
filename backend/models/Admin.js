const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
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
    
  
    role: {
      type: String,
      enum: ["super_admin", "content_moderator", "support_admin", "financial_admin"],
      default: "content_moderator",
    },
    
    permissions: {
      canManageUsers: { type: Boolean, default: false },
      canManageCourses: { type: Boolean, default: false },
      canManageContent: { type: Boolean, default: true },
      canManageFinancials: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
    },
    
  
    lastActive: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    
  
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    
   
    profilePicture: {
      type: String,
      default: "",
    },
    phoneNumber: String,
    
    
    notifications: {
      email: { type: Boolean, default: true },
      newUsers: { type: Boolean, default: true },
      courseSubmissions: { type: Boolean, default: true },
      payoutRequests: { type: Boolean, default: false },
      systemAlerts: { type: Boolean, default: true },
    },
    
   
    isActive: {
      type: Boolean,
      default: true,
    },
    lastPasswordChange: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error("Error hashing password:", err);
    next(err);
  }
});


adminSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});


adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.getSignedJwtToken = function () {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    {
      id: this._id,
      role: "admin",
      adminRole: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" }
  );
};


adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;