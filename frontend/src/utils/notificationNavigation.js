export const ROUTES = {

  STUDENT_CLASSROOM_ANNOUNCEMENTS: (classroomId) => `/student/classroom/${classroomId}/feed`,
  STUDENT_CLASSROOM_ASSIGNMENTS: (classroomId) => `/student/classroom/${classroomId}/assignments`,
  STUDENT_CLASSROOM_QUIZZES: (classroomId) => `/student/classroom/${classroomId}/quizzes`,
  

  NOTIFICATIONS: '/notifications',
};

export const resolveNotificationNavigation = (notification) => {
  const { type, action, metadata } = notification;


  if (action && action.type === 'navigate' && action.params.route) {
    return action.params.route;
  }


  switch (type) {
    case 'announcement':
      if (metadata?.classroomId) {
        return ROUTES.STUDENT_CLASSROOM_ANNOUNCEMENTS(metadata.classroomId);
      }
      break;
      
    case 'assignment_posted':
    case 'assignment_graded':
      if (metadata?.classroomId && metadata?.assignmentId) {
        return ROUTES.STUDENT_CLASSROOM_ASSIGNMENTS(metadata.classroomId);
      }
      break;
      
    case 'quiz_opened':
    case 'quiz_graded':
      if (metadata?.classroomId && metadata?.quizId) {
        return ROUTES.STUDENT_CLASSROOM_QUIZZES(metadata.classroomId);
      }
      break;
      
    case 'course_update':
      if (metadata?.courseId) {
        return `/courses/${metadata.courseId}`;
      }
      break;
  }


  return ROUTES.NOTIFICATIONS;
};

export const getNavigationState = (notification) => {
  return {
    highlightId: notification.metadata?.announcementId || 
                  notification.metadata?.assignmentId || 
                  notification.metadata?.quizId,
    scrollTo: 'notification',
    timestamp: notification.createdAt
  };
};