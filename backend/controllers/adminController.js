const Instructor = require("../models/Instructor");
const Student = require("../models/Student");

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    
    if (role === 'student') {
      query = Student.find();
    } else if (role === 'instructor') {
      query = Instructor.find();
    } else {
     
      const [students, instructors] = await Promise.all([
        Student.find().limit(parseInt(limit)).skip(skip),
        Instructor.find().limit(parseInt(limit)).skip(skip)
      ]);
      
      return res.json({
        success: true,
        data: {
          students,
          instructors,
          totalStudents: await Student.countDocuments(),
          totalInstructors: await Instructor.countDocuments(),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    }

    
    if (search) {
      query = query.or([
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]);
    }

    if (status && role === 'instructor') {
      query = query.where('verificationStatus', status);
    }

    const total = await (role === 'student' ? Student : Instructor).countDocuments(query._conditions);
    const users = await query
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    res.json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting users"
    });
  }
};

const verifyInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['verified', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'verified', 'rejected', or 'suspended'"
      });
    }

    const instructor = await Instructor.findById(id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: "Instructor not found"
      });
    }

    
    instructor.verificationStatus = status;
    
   
    if (instructor.verificationDocuments && instructor.verificationDocuments.length > 0) {
      instructor.verificationDocuments.forEach(doc => {
        doc.status = status === 'verified' ? 'approved' : 'rejected';
        doc.reviewedBy = req.user.id;
        doc.reviewedAt = new Date();
        if (notes) doc.notes = notes;
      });
    }

    await instructor.save();



    res.json({
      success: true,
      data: {
        _id: instructor._id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        verificationStatus: instructor.verificationStatus
      },
      message: `Instructor ${status === 'verified' ? 'verified' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error("Verify instructor error:", error);
    res.status(500).json({
      success: false,
      error: "Server error verifying instructor"
    });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalInstructors,
      pendingVerifications,
      totalCourses,
      recentSignups
    ] = await Promise.all([
      Student.countDocuments(),
      Instructor.countDocuments(),
      Instructor.countDocuments({ verificationStatus: 'pending' }),
      // Course.countDocuments(),
      0, // Placeholder
      Student.find().sort({ createdAt: -1 }).limit(10).select('firstName lastName email createdAt'),
      Instructor.find().sort({ createdAt: -1 }).limit(10).select('firstName lastName email verificationStatus createdAt')
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalInstructors,
          pendingVerifications,
          totalCourses
        },
        recentActivity: {
          studentSignups: recentSignups[0],
          instructorSignups: recentSignups[1]
        }
      }
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({
      success: false,
      error: "Server error getting system stats"
    });
  }
};

module.exports = {
  getUsers,
  verifyInstructor,
  getSystemStats
};