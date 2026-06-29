const cron = require('node-cron');
const Assignment = require('../models/Assignment');
const Classroom = require('../models/Classroom');
const { notifyDeadlineReminder } = require('../services/notificationService');


cron.schedule('0 * * * *', async () => {
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const in1h  = new Date(Date.now() +      60 * 60 * 1000);

  
  const assignments = await Assignment.find({
    dueDate: { $gte: in24h, $lt: new Date(in24h.getTime() + 60 * 60 * 1000) }
  });

  for (const assignment of assignments) {
    const classroom = await Classroom.findById(assignment.classroom).select('students');
    await notifyDeadlineReminder({
      assignment,
      classroomStudentIds: classroom.students,
      hoursLeft: 24,
    });
  }
});