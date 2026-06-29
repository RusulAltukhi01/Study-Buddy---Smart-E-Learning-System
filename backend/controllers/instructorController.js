const Instructor = require("../models/Instructor");
const Course = require("../models/Course");
const Classroom = require("../models/Classroom");
const Student = require('../models/Student');

const getInstructorById = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const instructor = await Instructor.findById(instructorId)
      .select(
        "-password -verificationDocuments -payoutMethod -stripeAccountId -stripeAccountStatus -resetPasswordToken -resetPasswordExpire -verificationToken -emailVerified -earnings.pending -earnings.paid -earnings.pendingPayoutAmount",
      ) 
      .populate({
        path: "coursesCreated",
        select:
          "title description thumbnail level price studentsEnrolled averageRating status",
        options: { limit: 10 },
      });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: "Instructor not found",
      });
    }

    const publicInstructorData = {
      id: instructor._id,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      fullName: instructor.fullName,
      email: instructor.email,
      profilePicture: instructor.profilePicture,
      headline: instructor.headline,
      bio: instructor.bio,
      phoneNumber: instructor.phoneNumber,
      dateOfBirth: instructor.dateOfBirth,

      expertise: instructor.expertise || [],
      qualifications:
        instructor.qualifications?.map((q) => ({
          degree: q.degree,
          institution: q.institution,
          year: q.year,
          description: q.description,
        })) || [],

      experienceYears: instructor.experienceYears,
      previousRoles:
        instructor.previousRoles?.map((role) => ({
          title: role.title,
          company: role.company,
          location: role.location,
          startDate: role.startDate,
          endDate: role.endDate,
          current: role.current,
          description: role.description,
          achievements: role.achievements,
        })) || [],

      socialLinks: {
        linkedin: instructor.socialLinks?.linkedin || "",
        twitter: instructor.socialLinks?.twitter || "",
        github: instructor.socialLinks?.github || "",
        website: instructor.socialLinks?.website || "",
        youtube: instructor.socialLinks?.youtube || "",
        facebook: instructor.socialLinks?.facebook || "",
      },

      stats: {
        totalStudents: instructor.totalStudents || 0,
        totalReviews: instructor.totalReviews || 0,
        averageRating: instructor.averageRating || 0,
        coursesPublished: instructor.coursesPublished || 0,
        totalCourseHours: instructor.totalCourseHours || 0,
        profileViews: instructor.profileViews || 0,
        instructorSince: instructor.instructorSince,
        lastActive: instructor.lastActive,
        responseTime: instructor.responseTime || 24,
        availability: instructor.availability || "available",
        teachingStyle: instructor.teachingStyle || [],
      },

      classrooms:
        instructor.coursesCreated?.map((course) => ({
          id: course._id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          level: course.level,
          price: course.price,
          studentsCount: course.studentsEnrolled?.length || 0,
          averageRating: course.averageRating || 0,
          status: course.status,
        })) || [],

      institution: instructor.institution || "",
      languages: instructor.languages || ["English"],
      teachingStyle: instructor.teachingStyle || [],

      verificationStatus: instructor.verificationStatus,
      isProfileComplete: instructor.isProfileComplete,

      emailNotifications: {
        newStudent: instructor.emailNotifications?.newStudent || true,
        courseReview: instructor.emailNotifications?.courseReview || true,
      },
    };

    instructor.profileViews = (instructor.profileViews || 0) + 1;
    await instructor.save();

    res.json({
      success: true,
      data: publicInstructorData,
    });
  } catch (error) {
    console.error("Get instructor by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching instructor",
    });
  }
};

const getInstructorDashboard = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.user.id);

    const [recentCourses, recentEnrollments] = await Promise.all([
      Course.find({ instructor: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title studentsEnrolled revenue status"),

      // Enrollment.find({ courseInstructor: req.user.id })
      //   .sort({ enrolledAt: -1 })
      //   .limit(10)
      //   .populate('student', 'firstName lastName email')
      //   .populate('course', 'title')
    ]);

    const dashboardData = {
      overview: {
        totalStudents: instructor.totalStudents || 0,
        averageRating: instructor.averageRating?.toFixed(1) || "0.0",
        coursesPublished: instructor.coursesPublished || 0,
        totalReviews: instructor.totalReviews || 0,
        profileViews: instructor.profileViews || 0,
      },
      earnings: {
        total: instructor.earnings?.total || 0,
        pending: instructor.earnings?.pending || 0,
        paid: instructor.earnings?.paid || 0,
        nextPayout: instructor.earnings?.nextPayoutDate || null,
      },
      recentCourses: recentCourses,
      recentEnrollments: recentEnrollments || [],
      verification: {
        status: instructor.verificationStatus,
        isComplete: instructor.isProfileComplete || false,
        documents: instructor.verificationDocuments?.length || 0,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get instructor dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting instructor dashboard",
    });
  }
};

const getInstructorCourses = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { instructor: req.user.id };
    if (status) query.status = status;

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .select(
        "title thumbnail price studentsEnrolled revenue averageRating status createdAt",
      )
      .populate("studentsEnrolled", "firstName lastName email");

    const stats = {
      total: courses.length,
      published: courses.filter((c) => c.status === "published").length,
      draft: courses.filter((c) => c.status === "draft").length,
      archived: courses.filter((c) => c.status === "archived").length,
      totalStudents: courses.reduce(
        (sum, course) => sum + (course.studentsEnrolled?.length || 0),
        0,
      ),
      totalRevenue: courses.reduce(
        (sum, course) => sum + (course.revenue || 0),
        0,
      ),
    };

    res.json({
      success: true,
      data: {
        stats,
        courses,
      },
    });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting courses",
    });
  }
};

const getInstructorStudents = async (req, res) => {
  try {
    const instructorId = req.user.id;
    
    // Get instructor's classroom IDs
    const instructorClassrooms = await Classroom.find({ 
      instructor: instructorId 
    }).select('_id name');
    
    const classroomIds = instructorClassrooms.map(c => c._id);
    
    if (classroomIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        students: []
      });
    }
    

    
    const students = await Student.find({
      'classroomsEnrolled.classroom': { $in: classroomIds }
    })
    .populate('classroomsEnrolled.classroom', 'name description') 
    .populate('coursesEnrolled.course', 'title') 
    .select('firstName lastName email phoneNumber profilePicture lastActive enrollmentDate progress submissions classroomsEnrolled coursesEnrolled educationLevel institution fieldOfStudy totalStudyHours');
    
    
    const cleanedStudents = students.map(student => {
      const studentObj = student.toObject();
      
 
      if (studentObj.classroomsEnrolled) {
        studentObj.classroomsEnrolled = studentObj.classroomsEnrolled.map(enrollment => ({
          classroom: enrollment.classroom, 
          enrollmentDate: enrollment.enrollmentDate,
          progress: enrollment.progress
        }));
      }
      
      return studentObj;
    });
    
    res.status(200).json({
      success: true,
      count: cleanedStudents.length,
      students: cleanedStudents,
    });
    
  } catch (error) {
    console.error("Get instructor students error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting students"
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      thumbnail,
      learningOutcomes,
      prerequisites,
      targetAudience,
      level,
    } = req.body;

    
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Title, description, and category are required",
      });
    }

    const instructor = await Instructor.findById(req.user.id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: "Instructor not found",
      });
    }

    const course = await Course.create({
      title,
      description,
      price: price || 0,
      category,
      thumbnail: thumbnail || "",
      learningOutcomes: learningOutcomes || [],
      prerequisites: prerequisites || [],
      targetAudience: targetAudience || [],
      level: level || "beginner",
      instructor: req.user.id,
      status: "draft",
    });

    instructor.coursesCreated.push(course._id);
    await instructor.save();

    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("Create course error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error creating course",
    });
  }
};

const getInstructorAnalytics = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.user.id);

    const courses = await Course.find({ instructor: req.user.id }).select(
      "title studentsEnrolled revenue averageRating ratings createdAt",
    );

    const analytics = {
      revenue: {
        total: instructor.earnings?.total || 0,
        monthly: calculateMonthlyRevenue(courses),
        byCourse: courses.map((c) => ({
          title: c.title,
          revenue: c.revenue || 0,
          students: c.studentsEnrolled?.length || 0,
        })),
      },
      students: {
        total: instructor.totalStudents || 0,
        growth: calculateStudentGrowth(courses),
        retention: 85,
      },
      ratings: {
        average: instructor.averageRating || 0,
        distribution: calculateRatingDistribution(courses),
        reviews: instructor.totalReviews || 0,
      },
      engagement: {
        completionRate: 75,
        averageProgress: 68,
        popularTimes: [],
      },
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get instructor analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting analytics",
    });
  }
};

const updateInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const allowedFields = [
      "firstName",
      "lastName",
      "headline",
      "phoneNumber",
      "bio",
      "expertise",
      "teachingStyle",
      "qualifications",
      "previousRoles",
      "availability",
      "responseTime",
      "socialLinks",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    
    const requiredFields = [
      "firstName",
      "lastName",
      "headline",
      "bio",
      "expertise",
    ];
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res
        .status(404)
        .json({ success: false, error: "Instructor not found" });
    }

    const merged = { ...instructor.toObject(), ...updates };
    const isComplete = requiredFields.every(
      (f) =>
        merged[f] &&
        (Array.isArray(merged[f])
          ? merged[f].length > 0
          : merged[f].trim?.() !== ""),
    );
    updates.isProfileComplete = isComplete;

    const updated = await Instructor.findByIdAndUpdate(
      instructorId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select(
      "-password -resetPasswordToken -resetPasswordExpire -verificationToken",
    );

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateInstructorProfile error:", err.message);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: errors.join(", ") });
    }
    return res
      .status(500)
      .json({ success: false, error: "Server error updating profile" });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationDocuments -payoutMethod -stripeAccountId -earnings.pending -earnings.paid",
    );

    if (!instructor) {
      return res
        .status(404)
        .json({ success: false, error: "Instructor not found" });
    }

    return res.json({ success: true, data: instructor });
  } catch (err) {
    console.error("getMyProfile error:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const calculateMonthlyRevenue = (courses) => {
  return [];
};

const calculateStudentGrowth = (courses) => {
  return 0;
};

const calculateRatingDistribution = (courses) => {
  return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
};

module.exports = {
  getInstructorById,
  getInstructorDashboard,
  getInstructorCourses,
  createCourse,
  getInstructorAnalytics,
  getInstructorStudents,
  updateInstructorProfile,
  getMyProfile,
};
