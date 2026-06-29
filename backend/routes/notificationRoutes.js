const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');


router.get('/', protect, async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipient: req.user.id, read: false }),
  ]);

  res.json({ success: true, data: notifications, unreadCount, page });
});


router.patch('/:id/read', protect, async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { read: true, readAt: new Date() }
  );
  res.json({ success: true });
});


router.patch('/read-all', protect, async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true, readAt: new Date() }
  );
  res.json({ success: true });
});

module.exports = router;