const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    
    
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    
    
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    
    
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    
  
    aspects: {
      contentQuality: { type: Number, min: 1, max: 5 },
      instructorQuality: { type: Number, min: 1, max: 5 },
      support: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
    },
    
    
    helpfulCount: {
      type: Number,
      default: 0,
    },
    reportedCount: {
      type: Number,
      default: 0,
    },
    
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
    },
    
   
    moderatorNotes: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    moderatedAt: Date,
    
    
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        comment: String,
        editedAt: Date,
      },
    ],
    
  
    studentProgress: {
      type: Number,
      min: 0,
      max: 100,
    },
    completionStatus: {
      type: String,
      enum: ["in-progress", "completed"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ course: 1, student: 1 }, { unique: true });


reviewSchema.index({ course: 1, rating: -1 });
reviewSchema.index({ student: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpfulCount: -1 });


reviewSchema.post("save", async function (doc) {
  if (doc.status === "approved") {
    const Course = mongoose.model("Course");
    const Review = mongoose.model("Review");
    
    
    const reviews = await Review.find({
      course: doc.course,
      status: "approved",
    });
    
    if (reviews.length > 0) {
      const totalRatings = reviews.length;
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;
      
    
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        distribution[review.rating]++;
      });
      
     
      await Course.findByIdAndUpdate(doc.course, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalRatings,
        totalReviews: totalRatings,
        ratingDistribution: distribution,
      });
    }
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;