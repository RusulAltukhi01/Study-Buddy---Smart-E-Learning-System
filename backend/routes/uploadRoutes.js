const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware.js");
const Student = require("../models/Student");
const Instructor = require("../models/Instructor");

const router = express.Router();
const uploadDir = "./uploads/profile-pictures";


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Only images are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

// Upload profile picture
router.post("/", protect, upload.single("profilePicture"), async (req, res) => {
  try {
    console.log("=== UPLOAD REQUEST ===");
    console.log("req.user from protect middleware:", req.user);
    console.log("User ID:", req.user?.id);
    console.log("User Role:", req.user?.role);
    console.log("Has file:", !!req.file);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const { id: userId, role } = req.user;
    let user;

    
    if (role === "student") {
      user = await Student.findById(userId);
    } else if (role === "instructor") {
      user = await Instructor.findById(userId);
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

    console.log("Found user:", user.email);

    
    if (user.profilePicture && user.profilePicture !== "") {
      const oldFilename = path.basename(user.profilePicture);
      const oldImagePath = path.join(uploadDir, oldFilename);

      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old image:", oldFilename);
        } catch (err) {
          console.warn("Could not delete old image:", err.message);
        }
      }
    }


    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    console.log("Profile picture updated:", imageUrl);

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: imageUrl,
      filename: req.file.filename,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: role,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload profile picture",
    });
  }
});


router.get("/", protect, async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    let user;

    if (role === "student") {
      user = await Student.findById(userId);
    } else if (role === "instructor") {
      user = await Instructor.findById(userId);
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid user role",
      });
    }

    if (!user || !user.profilePicture) {
      return res.status(404).json({
        success: false,
        error: "Profile picture not found",
      });
    }

    res.status(200).json({
      success: true,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile picture",
    });
  }
});


router.delete("/", protect, async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    let user;

    if (role === "student") {
      user = await Student.findById(userId);
    } else if (role === "instructor") {
      user = await Instructor.findById(userId);
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

    if (user.profilePicture) {
      const filename = path.basename(user.profilePicture);
      const filePath = path.join(uploadDir, filename);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log("Deleted image file:", filename);
        } catch (err) {
          console.warn("Could not delete image file:", err.message);
        }
      }

      user.profilePicture = "";
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile picture removed successfully",
        profilePicture: "",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "No profile picture to remove",
        profilePicture: "",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove profile picture",
    });
  }
});


router.use("/uploads/profile-pictures", express.static(uploadDir));

module.exports = router;
