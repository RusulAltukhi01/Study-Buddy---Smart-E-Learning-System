const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { 
  protect, 
  authorize, 
  isVerifiedInstructor 
} = require("../middleware/authMiddleware");
const {
  postAnnouncement,
  getAnnouncements,
  updateAnnouncement ,
  deleteAnnouncement,
  togglePin 
} = require("../controllers/announcementController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/announcements/"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/:classroomId", protect, authorize("instructor"), upload.array("attachments", 5), postAnnouncement);
router.get("/:classroomId", protect, getAnnouncements);
router.put("/:announcementId", protect, authorize("instructor"), updateAnnouncement);
router.delete("/:announcementId", protect, deleteAnnouncement);
router.patch("/:announcementId/pin", protect, authorize("instructor"), togglePin)

module.exports = router;