export const studentExportColumns = [
  {
    header: "Full Name",
    accessor: (student) => `${student.firstName || ''} ${student.lastName || student.name || ''}`.trim()
  },
  {
    header: "Email",
    accessor: "email"
  },
  {
    header: "Phone Number",
    accessor: "phoneNumber"
  },
  {
    header: "Enrollment Date",
    accessor: (student) => {
      const date = student.enrollmentDate || student.createdAt;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    }
  },
  {
    header: "Status",
    accessor: (student) => student.lastActive ? 'Active' : 'Archived'
  },
  {
    header: "Classes Enrolled",
    accessor: (student) => {
      
      if (student.classrooms && Array.isArray(student.classrooms) && student.classrooms.length > 0) {
        return student.classrooms.join(', ');
      }
      
      if (student.classroomsData && Array.isArray(student.classroomsData) && student.classroomsData.length > 0) {
        return student.classroomsData.map(c => c.name).join(', ');
      }
      
      if (student.coursesEnrolled && Array.isArray(student.coursesEnrolled) && student.coursesEnrolled.length > 0) {
        return student.coursesEnrolled.join(', ');
      }
      
      
      console.log("No classrooms found for student:", {
        name: `${student.firstName} ${student.lastName}`,
        hasClassrooms: !!student.classrooms,
        hasClassroomsData: !!student.classroomsData,
        hasCoursesEnrolled: !!student.coursesEnrolled,
        studentKeys: Object.keys(student)
      });
      
      return 'No classes';
    }
  },
  {
    header: "Average Grade",
    accessor: (student) => student.averageGrade || student.totalGrades || 'N/A'
  }
];