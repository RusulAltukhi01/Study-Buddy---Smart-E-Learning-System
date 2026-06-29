const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getUsers,
  verifyInstructor,
  getSystemStats
} = require("../controllers/adminController");


router.use(protect, authorize('admin'));


router.get("/users", getUsers);
router.put("/instructors/:id/verify", verifyInstructor);


router.get("/stats", getSystemStats);

module.exports = router;