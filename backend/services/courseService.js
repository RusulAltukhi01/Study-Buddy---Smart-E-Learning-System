const Course = require("../models/Course");

async function createCourse(courseData) {
  const course = new Course(courseData);
  await course.save();
  return course;
}

async function saveDraft(courseData) {
  return createCourse({ ...courseData, status: "active" });
}

async function getCoursesByInstructor(instructorId) {
  return Course.find({ instructor: instructorId })
    .select("-studentsEnrolled -admins -coInstructors")
    .sort({ createdAt: -1 })
    .lean();
}

async function getCourseById(courseId) {
  const course = await Course.findById(courseId)
    .populate("instructor", "name avatar")
    .lean();

  if (!course) {
    const err = new Error("Course not found");
    err.statusCode = 404;
    throw err;
  }

  return course;
}

async function getCoursesByClassroom(classroomId) {
  const results = await Course.find({ "classrooms.classroom": classroomId })
    .sort({ createdAt: -1 })
    .lean();

  return results;
}

async function assignCourseToClassroom(courseId, classroomId, instructorId) {

  const existing = await Course.findOne({
    _id: courseId,
    "classrooms.classroom": classroomId,
  });

  if (existing) {
    const err = new Error("Course already assigned to this classroom");
    err.statusCode = 409;
    throw err;
  }

  return Course.findByIdAndUpdate(
    courseId,
    {
      $push: {
        classrooms: {
          classroom: classroomId,
          assignedBy: instructorId,
          assignedAt: new Date(),
        },
      },
    },
    { new: true }
  );
}

async function unassignCourseFromClassroom(courseId, classroomId) {
  return Course.findByIdAndUpdate(
    courseId,
    { $pull: { classrooms: { classroom: classroomId } } }, 
    { new: true }
  );
}

async function updateCourse(courseId, instructorId, updates) {
  const course = await Course.findOneAndUpdate(
    { _id: courseId, instructor: instructorId },
    { $set: { ...updates, lastUpdated: new Date() } },
    { new: true, runValidators: true }
  );

  if (!course) {
    const err = new Error("Course not found or you don't have permission");
    err.statusCode = 404;
    throw err;
  }

  return course;
}

async function archiveCourse(courseId, instructorId) {
  const course = await Course.findOneAndUpdate(
    { _id: courseId, instructor: instructorId },
    { $set: { status: "archived", lastUpdated: new Date() } },
    { new: true }
  );

  if (!course) {
    const err = new Error("Course not found or you don't have permission");
    err.statusCode = 404;
    throw err;
  }

  return course;
}

module.exports = {
  createCourse,
  saveDraft,
  getCoursesByInstructor,
  getCourseById,
  getCoursesByClassroom,
  assignCourseToClassroom,
  unassignCourseFromClassroom,
  updateCourse,
  archiveCourse,
};