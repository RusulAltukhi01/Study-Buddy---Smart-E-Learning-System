const jwt = require('jsonwebtoken');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');

const protect = async (req, res, next) => {
  try {

    console.log('Protect middleware called');
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    


    let token;


    if (req.cookies.token) {
      token = req.cookies.token;
    }

    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token',
      });
    }

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user;
      if (decoded.role === 'instructor') {
        user = await Instructor.findById(decoded.id);
      } else if (decoded.role === 'student') {
        user = await Student.findById(decoded.id);
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid user role in token',
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
        });
      }

      req.user = {
        id: user._id.toString(),      
        role: decoded.role   
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed',
      });
    }
  } catch (err) {
    console.error('Protect middleware error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication',
    });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    //  console.log("authorize - req.user.role:", req.user?.role);
    // console.log("authorize - allowed roles:", roles);
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const userRole = req.user.role; 
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `User role "${userRole}" is not authorized to access this route. Allowed roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};


const isVerifiedInstructor = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'Only instructors can access this route'
      });
    }

    const instructor = await Instructor.findById(req.user.id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor not found'
      });
    }
    
    if (instructor.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        error: 'Instructor account not verified. Please wait for verification.'
      });
    }
 
    req.instructor = instructor;
    next();
  } catch (error) {
    console.error('Verified instructor middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

const isStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      error: 'Only students can access this route'
    });
  }
  next();
};

const isEmailVerified = async (req, res, next) => {
  try {
    let user;
    if (req.user.role === 'instructor') {
      user = await Instructor.findById(req.user.id);
    } else {
      user = await Student.findById(req.user.id);
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email first'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


module.exports = {
  protect,
  authorize,
  isVerifiedInstructor,
  isStudent,
  isEmailVerified
};