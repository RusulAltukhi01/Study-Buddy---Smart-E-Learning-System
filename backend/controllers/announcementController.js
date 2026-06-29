const Announcement = require("../models/Announcement");
const Classroom = require("../models/Classroom");
const Instructor = require("../models/Instructor");
const Notification = require("../models/Notification");
const { sendBulkNotifications } = require("../utils/sendNotification");

const postAnnouncement = async (req, res) => {
  try {
    const { content } = req.body;
    const { classroomId } = req.params;

    if (!content || content.trim() === "" || content === "<p></p>") {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }

    const attachments = (req.files || []).map((file) => ({
      originalName: file.originalname,
      storedName: file.filename,
      url: `/uploads/announcements/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const announcement = await Announcement.create({
      classroomId,
      author: req.user.id,
      content,
      attachments,
    });

    const author = await Instructor.findById(req.user.id).select(
      "firstName lastName profilePicture",
    );


    const io = req.app.get('io');

    const classroom = await Classroom.findById(classroomId).populate('students');
    
    if (classroom && classroom.students && classroom.students.length > 0) {

      await sendBulkNotifications(
        classroom.students,
        'Student',
        {
          type: 'announcement',
          title: `New Announcement in ${classroom.name}`,
          message: content.replace(/<[^>]*>/g, '').substring(0, 100),
          link: `/student/classrooms/${classroomId}/feed`,
          action: {
            type: 'navigate',
            params: {
              route: 'STUDENT_CLASSROOM_ANNOUNCEMENTS',
              metadata: { classroomId, announcementId: announcement._id }
            }
          },
          metadata: {
            classroomId,
            announcementId: announcement._id
          }
        },
        io
      );
    }


    res.status(201).json({
      success: true,
      data: { ...announcement.toObject(), author },
    });
  } catch (err) {
    console.error("postAnnouncement error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      classroomId: req.params.classroomId,
    }).sort({ createdAt: -1 });

    const populated = await Promise.all(
      announcements.map(async (ann) => {
        const author = await Instructor.findById(ann.author).select(
          "firstName lastName profilePicture",
        );
        return { ...ann.toObject(), author };
      }),
    );

    res.json({ success: true, data: populated });
  } catch (err) {
    console.error("getAnnouncements error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.announcementId);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, error: "Announcement not found" });
    }

    if (announcement.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    announcement.content = req.body.content;
    await announcement.save();

    const author = await Instructor.findById(req.user.id).select(
      "firstName lastName profilePicture",
    );

    res.json({ success: true, data: { ...announcement.toObject(), author } });
  } catch (err) {
    console.error("updateAnnouncement error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.announcementId);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, error: "Announcement not found" });
    }

    if (announcement.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    await announcement.deleteOne();

    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    console.error("deleteAnnouncement error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const togglePin = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.announcementId);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, error: "Announcement not found" });
    }

    if (announcement.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    announcement.pinned = !announcement.pinned;
    await announcement.save();

    res.json({ success: true, data: { pinned: announcement.pinned } });
  } catch (err) {
    console.error("togglePin error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  postAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  togglePin,
};
