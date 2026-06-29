const crypto = require('crypto'); 
const jwt = require("jsonwebtoken");
const Instructor = require("../models/Instructor");
const Student = require("../models/Student");
const { generateOTP, sendOTPEmail } = require("../services/emailService");
const sendEmail = require("../utils/sendEmail");

const studentSignup = async (req, res) => {
  console.log("Request body:", req.body);

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords don't match",
      });
    }

 

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be 8-15 characters with at least one uppercase letter, one lowercase letter, one number, and one special character (@.#$!%*?&)",
      });
    }

    const [existingStudent, existingInstructor] = await Promise.all([
      Student.findOne({ email }),
      Instructor.findOne({ email }),
    ]);

    console.log("Existing student:", existingStudent ? "Found" : "Not found");
    console.log(
      "Existing instructor:",
      existingInstructor ? "Found" : "Not found",
    );

    if (existingStudent || existingInstructor) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    console.log("Creating student document...");
    const student = await Student.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      isVerified: false,
    });

    const otp = generateOTP();
    student.otpCode = otp;
    student.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await student.save();
    await sendOTPEmail(student.email, otp);

    // const otp = generateOTP();
    // instructor.otpCode = otp;
    // instructor.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    // await instructor.save();
    // await sendOTPEmail(instructor.email, otp);

    // const token = student.getSignedJwtToken();
    const tempToken = jwt.sign(
      { id: student._id, role: "student", isPending: true },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    res.status(201).json({
      success: true,
      message: "OTP sent to your email.",
      data: { token: tempToken, email: student.email },
    });

    
  } catch (err) {
    console.error("Student Signup error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error during signup",
    });
  }
};

const instructorSignup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      headline,
      bio,
      expertise = [],
      qualifications = [],
      experienceYears = 0,
      socialLinks = {},
      profilePicture = "",
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !headline ||
      !bio
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords don't match",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be 8-15 characters with at least one uppercase letter, one lowercase letter, one number, and one special character (@.#$!%*?&)",
      });
    }

    if (!headline.trim()) {
      return res.status(400).json({
        success: false,
        error: "Headline is required",
      });
    }

    if (headline.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: "Headline cannot exceed 100 characters",
      });
    }

    if (!bio.trim()) {
      return res.status(400).json({
        success: false,
        error: "Bio is required",
      });
    }

    if (bio.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: "Bio must be at least 50 characters",
      });
    }

    if (bio.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Bio cannot exceed 1000 characters",
      });
    }

    const [existingStudent, existingInstructor] = await Promise.all([
      Student.findOne({ email }),
      Instructor.findOne({ email }),
    ]);

    if (existingStudent || existingInstructor) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    const instructor = await Instructor.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      headline,
      bio,
      expertise: Array.isArray(expertise) ? expertise : [expertise],
      qualifications: Array.isArray(qualifications)
        ? qualifications
        : [qualifications],
      experienceYears: parseInt(experienceYears) || 0,
      socialLinks,
      profilePicture,
      instructorSince: new Date(),
      isVerified: true, //temp
    });

    const otp = generateOTP();
    student.otpCode = otp;
    student.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await student.save();
    await sendOTPEmail(student.email, otp);

    const tempToken = jwt.sign(
      { id: instructor._id, role: "instructor", isPending: true },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    res.status(201).json({
      success: true,
      message: "OTP sent to your email.",
      data: { token: tempToken, email: instructor.email },
    });

    // const token = instructor.getSignedJwtToken();

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 30 * 24 * 60 * 60 * 1000,
    // });

    // res.status(201).json({
    //   success: true,
    //   data: {
    //     _id: instructor._id,
    //     firstName: instructor.firstName,
    //     lastName: instructor.lastName,
    //     email: instructor.email,
    //     phoneNumber: instructor.phoneNumber,
    //     profilePicture: instructor.profilePicture || "",
    //     role: "instructor",
    //     headline: instructor.headline,
    //     bio: instructor.bio,
    //     expertise: instructor.expertise || [],
    //     qualifications: instructor.qualifications || [],
    //     experienceYears: instructor.experienceYears || 0,
    //     // verificationStatus: instructor.verificationStatus,
    //     instructorSince: instructor.instructorSince,
    //     createdAt: instructor.createdAt,
    //     token: token,
    //   },
    // });
  } catch (err) {
    console.error("Instructor Signup error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error during instructor signup",
    });
  }
};

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Please provide email and password",
//       });
//     }

//     const [student, instructor] = await Promise.all([
//       Student.findOne({ email }).select("+password"),
//       Instructor.findOne({ email }).select("+password"),
//     ]);

//     const user = student || instructor;

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid credentials",
//       });
//     }

//     const isPasswordMatch = await user.matchPassword(password);

//     if (!isPasswordMatch) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid credentials",
//       });
//     }

//     // if (user.constructor.modelName === "Instructor") {
//     //   if (user.verificationStatus !== "verified") {
//     //     return res.status(403).json({
//     //       success: false,
//     //       error: `Instructor account is ${user.verificationStatus}. Please wait for verification.`,
//     //       verificationStatus: user.verificationStatus,
//     //     });
//     //   }
//     // }

//     const token = user.getSignedJwtToken();

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 30 * 24 * 60 * 60 * 1000,
//     });

//     const userData = {
//       _id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       profilePicture: user.profilePicture || "",
//       phoneNumber: user.phoneNumber,
//       role: user.constructor.modelName.toLowerCase(),
//       createdAt: user.createdAt,
//       token,
//     };

//     if (user.constructor.modelName === "Instructor") {
//       userData.headline = user.headline;
//       // userData.verificationStatus = user.verificationStatus;
//       userData.bio = user.bio;
//       userData.expertise = user.expertise || [];
//       userData.experienceYears = user.experienceYears || 0;
//       userData.socialLinks = user.socialLinks || {};
//     }

//     res.json({
//       success: true,
//       data: {
//         ...userData,
//         token,
//       },
//     });
//   } catch (err) {
//     console.log("Login error: ", err);
//     res.status(500).json({
//       success: false,
//       error: "Server error during login",
//     });
//   }
// };

const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const { id: userId, role } = req.user;

    let user;

    if (role === "instructor") {
      user = await Instructor.findById(userId);
    } else if (role === "student") {
      user = await Student.findById(userId);
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid user role",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture || "",
      phoneNumber: user.phoneNumber,
      role: role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (role === "instructor") {
      Object.assign(userData, {
        headline: user.headline,
        bio: user.bio,
        // verificationStatus: user.verificationStatus,
        expertise: user.expertise || [],
        experienceYears: user.experienceYears || 0,
        socialLinks: user.socialLinks || {},
        qualifications: user.qualifications || [],
        coursesCreated: user.coursesCreated || [],
        totalStudents: user.totalStudents || 0,
        averageRating: user.averageRating || 0,
        totalReviews: user.totalReviews || 0,
        instructorSince: user.instructorSince,
        lastActive: user.lastActive,
        profileViews: user.profileViews || 0,
        emailNotifications: user.emailNotifications || {},
        isProfileComplete: user.isProfileComplete || false,
      });
    } else if (role === "student") {
      Object.assign(userData, {
        studentId: user.studentId,
        enrollmentDate: user.enrollmentDate,
        dateOfBirth: user.dateOfBirth,
        educationLevel: user.educationLevel,
        coursesEnrolled: user.coursesEnrolled || [],
        completedCourses: user.completedCourses || [],
        certificates: user.certificates || [],
        totalStudyHours: user.totalStudyHours || 0,
        badges: user.badges || [],
        subscription: user.subscription || {},
        wishlist: user.wishlist || [],
      });
    }

    res.json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.log("Get user error: ", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

const updateProfile = async (req, res) => {
  try {
    console.log("updateProfile called");
    console.log("User ID:", req.user.id);
    console.log("User Type:", req.user.role);
    console.log("Request body:", req.body);

    const { id: userId, role } = req.user;
    const {
      firstName,
      lastName,
      phoneNumber,
      profilePicture,
      // for instructors
      bio,
      headline,
    } = req.body;

    if (
      firstName.length === 0 ||
      !lastName.length === 0 ||
      !phoneNumber.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "First name and last name and phone number are required",
      });
    }

    if (phoneNumber) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid phone number (e.g., +1234567890)",
        });
      }
    }

    // let user;
    let updatedUser;

    if (role === "instructor") {
      console.log("Updating instructor profile...");

      // required fields for instructor
      const updateData = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber,
        bio,
        headline,
      };

      if (profilePicture !== undefined) {
        updateData.profilePicture = profilePicture;
      }

      updatedUser = await Instructor.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });
    } else if (role === "student") {
      console.log("Updating student profile...");

      const updateData = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber,
      };

      if (profilePicture !== undefined) {
        updateData.profilePicture = profilePicture;
      }

      updatedUser = await Student.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid user type",
      });
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("Profile updated successfully:", updatedUser);

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || "",
        phoneNumber: updatedUser.phoneNumber,
        role: role,
        ...(role === "instructor" && {
          headline: updatedUser.headline || "",
          bio: updatedUser.bio || "",
        }),
      },
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("updateProfile error:", err);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate field value entered",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error during profile update: " + err.message,
    });
  }
};

const findUserByEmail = async (email) => {
  const student = await Student.findOne({ email });
  if (student) return { user: student, Model: Student, role: "student" };

  const instructor = await Instructor.findOne({ email });
  if (instructor)
    return { user: instructor, Model: Instructor, role: "instructor" };

  return null;
};

// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email)
//       return res
//         .status(400)
//         .json({ success: false, error: "Email is required" });

//     const found = await findUserByEmail(email.toLowerCase());

//     if (!found) {
//       return res.json({
//         success: true,
//         message: "If that email exists, a reset code was sent.",
//       });
//     }

//     const { user } = found;

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

//     user.otpCode = otp;
//     user.otpExpires = otpExpires;
//     await user.save({ validateBeforeSave: false });

//     await sendEmail({
//       to: email,
//       subject: "Your StudyBuddy password reset code",
//       html: `
//         <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
//           <h2 style="color:#1e3a5f;">Password Reset</h2>
//           <p>Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
//           <div style="font-size:36px;font-weight:bold;letter-spacing:10px;text-align:center;padding:24px;background:#f5f7ff;border-radius:8px;color:#ef7605;">
//             ${otp}
//           </div>
//           <p style="color:#999;font-size:13px;margin-top:24px;">If you didn't request this, ignore this email.</p>
//         </div>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: "If that email exists, a reset code was sent.",
//     });
//   } catch (err) {
//     console.error("forgotPassword error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });

    const found = await findUserByEmail(email.toLowerCase());

    if (!found) {
      return res.json({
        success: true,
        message: "If that email exists, a reset code was sent.",
      });
    }

    const { user } = found;

    const otp = generateOTP(); 
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, otp);

    return res.json({
      success: true,
      message: "If that email exists, a reset code was sent.",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    let user;
    if (req.user.role === "instructor") {
      user = await Instructor.findById(req.user.id);
    } else {
      user = await Student.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Email verified successfully!",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: req.user.role,
        token,
      },
    });
  } catch (err) {
    console.error("verifyOTP error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// const verifyResetOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp)
//       return res
//         .status(400)
//         .json({ success: false, error: "Email and OTP required" });

//     const found = await findUserByEmail(email.toLowerCase());
//     if (!found)
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid or expired code" });

//     const { user } = found;

//     if (
//       !user.otpCode ||
//       user.otpCode !== otp ||
//       !user.otpExpires ||
//       user.otpExpires < new Date()
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid or expired code" });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
//     user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
//     user.otpCode = undefined;
//     user.otpExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return res.json({ success: true, resetToken }); // send raw token to client
//   } catch (err) {
//     console.error("verifyResetOtp error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

const resendOTP = async (req, res) => {
  try {
    let user;
    if (req.user.role === "instructor") {
      user = await Instructor.findById(req.user.id);
    } else {
      user = await Student.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, error: "Already verified" });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    await sendOTPEmail(user.email, otp);
    res.json({ success: true, message: "New OTP sent!" });
  } catch (err) {
    console.error("resendOTP error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, error: "Email and OTP required" });

    const found = await findUserByEmail(email.toLowerCase());
    if (!found)
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired code" });

    const { user } = found;

    if (
      !user.otpCode ||
      user.otpCode !== otp ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired code" });
    }


    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.json({ success: true, resetToken });
  } catch (err) {
    console.error("verifyResetOtp error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;
    if (!email || !resetToken || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields required" });
    }

   
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    const found = await findUserByEmail(email.toLowerCase());

    if (
      !found ||
      found.user.resetPasswordToken !== hashedToken ||
      found.user.resetPasswordExpire < new Date()
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Reset link is invalid or expired" });
    }

    const { user } = found;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be 8-15 characters with uppercase, lowercase, number, and special character",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully. Please log in.",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide email and password" });
    }

    const [student, instructor] = await Promise.all([
      Student.findOne({ email }).select("+password"),
      Instructor.findOne({ email }).select("+password"),
    ]);

    const user = student || instructor;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    if (!user.isVerified && user.constructor.modelName !== "Instructor") {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in",
        isVerified: false,
      });
    }

    const token = user.getSignedJwtToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture || "",
      phoneNumber: user.phoneNumber,
      role: user.constructor.modelName.toLowerCase(),
      createdAt: user.createdAt,
      token,
    };

    if (user.constructor.modelName === "Instructor") {
      userData.headline = user.headline;
      userData.bio = user.bio;
      userData.expertise = user.expertise || [];
      userData.experienceYears = user.experienceYears || 0;
      userData.socialLinks = user.socialLinks || {};
    }

    res.json({ success: true, data: { ...userData, token } });
  } catch (err) {
    console.log("Login error: ", err);
    res
      .status(500)
      .json({ success: false, error: "Server error during login" });
  }
};
module.exports = {
  studentSignup,
  instructorSignup,
  login,
  getMe,
  logout,
  updateProfile,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
