const {
  createCourseSchema,
  updateCourseSchema,
} = require("../validators/courseValidator");
const { sanitizeCourseData } = require("../sanitizers/courseSanitizer");
const courseService = require("../services/courseService");

function formatJoiErrors(joiError) {
  return joiError.details.map((d) => ({
    field: d.path
      .map((segment, i) =>
        typeof segment === "number"
          ? `[${segment}]`
          : i === 0
            ? segment
            : `.${segment}`,
      )
      .join(""),
    message: d.message,
  }));
}

async function createCourse(req, res, next) {
  console.log("req.user:", req.user);
  console.log("auth header:", req.headers.authorization);

  const classroomId = req.body.classroomId; 
  console.log("incoming status:", req.body.status);

  try {
    const { error, value: validated } = createCourseSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, 
    });

    if (error) {
      console.log("Joi errors:", JSON.stringify(error.details, null, 2));
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: formatJoiErrors(error),
      });
    }

    console.log(
      "validated sections:",
      JSON.stringify(validated.sections, null, 2),
    );
    const instructorId = req.user.id;
    const cleanData = sanitizeCourseData(validated, instructorId);

  
    if (classroomId) {
      cleanData.classrooms = [
        {
          classroom: classroomId,
          assignedBy: instructorId,
          assignedAt: new Date(),
        },
      ];
    }

    const course = await courseService.createCourse(cleanData);

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (err) {
    console.error("createCourse error:", err);
    if (err && err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    next(err);
  }
}

async function saveDraft(req, res, next) {
  try {
    const draftSchema = createCourseSchema.fork(
      ["title", "description", "category", "sections", "learningOutcomes"],
      (field) => field.optional(),
    );

    const { error, value: validated } = draftSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(422).json({
        success: false,
        message: "Could not save draft",
        errors: formatJoiErrors(error),
      });
    }

    const instructorId = req.user.id;
    const cleanData = sanitizeCourseData(validated, instructorId);
    const course = await courseService.saveDraft(cleanData);

    return res.status(201).json({
      success: true,
      message: "Draft saved",
      data: { courseId: course._id, status: course.status },
    });
  } catch (err) {
    next(err);
  }
}

async function getMyCourses(req, res, next) {
  try {
    const courses = await courseService.getCoursesByInstructor(req.user.id);
    return res.status(200).json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

async function getCourse(req, res, next) {
  try {
    const course = await courseService.getCourseById(req.params.id);
    return res.status(200).json({ success: true, data: course });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const { error, value: validated } = updateCourseSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: formatJoiErrors(error),
      });
    }

    const cleanData = sanitizeCourseData(validated, req.user.id);
    const course = await courseService.updateCourse(
      req.params.id,
      req.user.id,
      cleanData,
    );

    return res
      .status(200)
      .json({ success: true, message: "Course updated", data: course });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function archiveCourse(req, res, next) {
  try {
    await courseService.archiveCourse(req.params.id, req.user.id);
    return res
      .status(200)
      .json({ success: true, message: "Course archived successfully" });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function getClassroomCourses(req, res, next) {
  // console.log("getClassroomCourses, classroomId:", req.params.classroomId);

  try {
    const courses = await courseService.getCoursesByClassroom(
      req.params.classroomId,
    );
    return res.status(200).json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

async function assignCourse(req, res, next) {
  try {
    const { courseId } = req.body;
    const { classroomId } = req.params;
    const instructorId = req.user.id;
    const course = await courseService.assignCourseToClassroom(
      courseId,
      classroomId,
      instructorId,
    );
    return res.status(200).json({ success: true, data: course });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function unassignCourse(req, res, next) {
  try {
    await courseService.unassignCourseFromClassroom(
      req.params.courseId,
      req.params.classroomId,
    );
    return res
      .status(200)
      .json({ success: true, message: "Course unassigned" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCourse,
  saveDraft,
  getMyCourses,
  getCourse,
  updateCourse,
  archiveCourse,
  getClassroomCourses,
  assignCourse,
  unassignCourse,
};
