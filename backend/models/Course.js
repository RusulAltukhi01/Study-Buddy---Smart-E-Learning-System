const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      minlength: [100, "Description must be at least 100 characters"],
    },

    
    thumbnail: {
      type: String,
      default: "",
    },
    previewVideo: {
      type: String,
      default: "",
    },

    
    category: {
      type: String,
      required: [true, "Course category is required"],
    },
    subcategory: String,
    tags: [String],

    
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    duration: {
      totalHours: { type: Number, default: 0 },
      totalMinutes: { type: Number, default: 0 },
      totalLectures: { type: Number, default: 0 },
    },

   
    sections: [
      {
        title: { type: String, required: true },
        description: String,
        weekNumber: { type: Number, default: 1 },
        order: Number,
        lectures: [
          {
            title: { type: String, required: true },
            description: String,
            videoUrl: String,
            videoDuration: Number,
            resources: [
              {
                name: { type: String, trim: true },
                size: { type: String, default: "" },
                url: { type: String, default: "" },
              },
            ],
            isPreview: { type: Boolean, default: false },
            order: Number,
          },
        ],
      },
    ],

    
    learningOutcomes: [{ type: String, required: true }],
    prerequisites: [String],
    targetAudience: [String],
    requirements: [String],
    resources: [
      {
        name: { type: String, trim: true, default: "" },
        size: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],


    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    coInstructors: [
      {
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
        role: String,
      },
    ],


    classrooms: [
      {
        classroom: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Classroom",
        },
        assignedAt: { type: Date, default: Date.now },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Instructor",
        },
      },
    ],

   
    studentsEnrolled: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        enrolledVia: {
          type: String,
          enum: ["classroom", "direct"],
          default: "classroom",
        },
        classroom: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Classroom",
        },
        enrollmentDate: { type: Date, default: Date.now },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        lastAccessed: { type: Date, default: Date.now },
        completedLectures: [
          { type: mongoose.Schema.Types.ObjectId }, 
        ],
        completed: { type: Boolean, default: false },
        completedAt: Date,
        score: Number,
      },
    ],


    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    averageCompletionTime: { type: Number, default: 0 }, // in days
    averageScore: { type: Number, default: 0 },

   
    admins: [
      {
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
        },
        role: {
          type: String,
          enum: ["viewer", "editor", "moderator"],
          default: "viewer",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "flagged", "suspended"],
      default: "pending",
    },
    moderationNotes: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    moderatedAt: Date,

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active",
    },
    publishedAt: Date,
    lastUpdated: Date,

    language: { type: String, default: "English" },
    providesCertificate: { type: Boolean, default: false },
    certificateTemplate: String,
    allowLateAccess: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


courseSchema.virtual("enrollmentCount").get(function () {
  return this.studentsEnrolled?.length || 0;
});

courseSchema.virtual("completionCount").get(function () {
  return this.studentsEnrolled?.filter((e) => e.completed).length || 0;
});

courseSchema.virtual("classroomCount").get(function () {
  return this.classrooms?.length || 0;
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
