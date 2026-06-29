const Notification = require('../models/Notification');
const { notifyUser, notifyClassroom } = require('../config/socket');


const createAndSend = async (recipientIds, payload) => {

  const docs = recipientIds.map(id => ({ ...payload, recipient: id }));
  const saved = await Notification.insertMany(docs);

  recipientIds.forEach((id, i) => {
    notifyUser(id.toString(), {
      ...saved[i].toObject(),
      _id: saved[i]._id,
    });
  });

  return saved;
};

const notifyQuizOpened = async ({ quiz, classroomStudentIds }) => {
  return createAndSend(classroomStudentIds, {
    type: 'quiz_opened',
    title: ' New Quiz Available',
    message: `"${quiz.title}" is now open.`,
    link: `/classroom/${quiz.classroom}/quiz/${quiz._id}`,
    metadata: { quizId: quiz._id, classroomId: quiz.classroom },
  });
};

const notifyAssignmentPosted = async ({ assignment, classroomStudentIds }) => {
  return createAndSend(classroomStudentIds, {
    type: 'assignment_posted',
    title: 'New Assignment',
    message: `"${assignment.title}" has been posted. Due: ${new Date(assignment.dueDate).toLocaleDateString()}.`,
    link: `/classroom/${assignment.classroom}/assignment/${assignment._id}`,
    metadata: { assignmentId: assignment._id, classroomId: assignment.classroom },
  });
};

const notifyAssignmentGraded = async ({ assignment, studentId, grade }) => {
  return createAndSend([studentId], {
    type: 'assignment_graded',
    title: ' Assignment Graded',
    message: `Your submission for "${assignment.title}" was graded: ${grade}.`,
    link: `/classroom/${assignment.classroom}/assignment/${assignment._id}`,
    metadata: { assignmentId: assignment._id, grade },
  });
};

const notifyQuizGraded = async ({ quiz, studentId, score }) => {
  return createAndSend([studentId], {
    type: 'quiz_graded',
    title: 'Quiz Graded',
    message: `Your quiz "${quiz.title}" result: ${score}.`,
    link: `/classroom/${quiz.classroom}/quiz/${quiz._id}/result`,
    metadata: { quizId: quiz._id, score },
  });
};

const notifyAnnouncement = async ({ announcement, classroomStudentIds }) => {
  return createAndSend(classroomStudentIds, {
    type: 'announcement',
    title: 'New Announcement',
    message: announcement.title,
    link: `/classroom/${announcement.classroom}/announcements`,
    metadata: { announcementId: announcement._id, classroomId: announcement.classroom },
  });
};

const notifyDeadlineReminder = async ({ assignment, classroomStudentIds, hoursLeft }) => {
  return createAndSend(classroomStudentIds, {
    type: 'assignment_deadline',
    title: 'Deadline Reminder',
    message: `"${assignment.title}" is due in ${hoursLeft} hour(s).`,
    link: `/classroom/${assignment.classroom}/assignment/${assignment._id}`,
    metadata: { assignmentId: assignment._id, hoursLeft },
  });
};

module.exports = {
  notifyQuizOpened,
  notifyAssignmentPosted,
  notifyAssignmentGraded,
  notifyQuizGraded,
  notifyAnnouncement,
  notifyDeadlineReminder,
};