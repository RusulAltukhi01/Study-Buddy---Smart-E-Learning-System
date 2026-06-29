export const ROUTES = {
  // Student routes
  STUDENT_CLASSROOM_FEED: (classroomId) => `/student/classrooms/${classroomId}/feed`,
  STUDENT_CLASSROOM_ANNOUNCEMENTS: (classroomId) => `/student/classrooms/${classroomId}/announcements`,
  STUDENT_CLASSROOM_ASSIGNMENTS: (classroomId) => `/student/classrooms/${classroomId}/assignments`,
  STUDENT_CLASSROOM_QUIZZES: (classroomId) => `/student/classrooms/${classroomId}/quizzes`,
  
  // Instructor routes
  INSTRUCTOR_CLASSROOM_FEED: (classroomId) => `/instructor/classrooms/${classroomId}/feed`,
  INSTRUCTOR_CLASSROOM_MANAGE: (classroomId) => `/instructor/classrooms/${classroomId}/manage`,
  

  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};