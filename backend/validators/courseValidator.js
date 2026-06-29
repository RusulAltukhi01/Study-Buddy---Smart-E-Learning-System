const Joi = require("joi");

const resourceSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  url: Joi.string().uri().allow("").default(""),
  type: Joi.string().trim().max(50).allow("").default(""),
  size: Joi.number().min(0).default(0),
});

const lectureSchema = Joi.object({
  title: Joi.string().trim().min(3).max(300).required().messages({
    "string.min": "Lecture title must be at least 2 characters",
    "string.empty": "Lecture title is required",
    "any.required": "Lecture title is required",
  }),
  description: Joi.string().trim().max(1000).allow("").default(""),
  videoUrl: Joi.string().uri().allow("").default(""),
  videoDuration: Joi.number().min(0).default(0).messages({
    "number.min": "Lecture duration cannot be negative",
  }),
  resources: Joi.array().items(resourceSchema).default([]),
  isPreview: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).default(0),
});

const sectionSchema = Joi.object({
  title: Joi.string().trim().min(3).max(300).required().messages({
    "string.min": "Section title must be at least 2 characters",
    "string.empty": "Section title is required",
    "any.required": "Section title is required",
  }),
  description: Joi.string().trim().max(1000).allow("").default(""),
  weekNumber: Joi.number().integer().min(1).default(1),
  order: Joi.number().integer().min(0).default(0),
  lectures: Joi.array().items(lectureSchema).min(1).required().messages({
    "array.min": "Each section must have at least one lecture",
    "any.required": "Lectures are required in each section",
  }),
});

const createCourseSchema = Joi.object({
  title: Joi.string().trim().min(10).max(200).required().messages({
    "string.min": "Title must be at least 10 characters",
    "string.empty": "Course title is required",
    "any.required": "Course title is required",
  }),

  subtitle: Joi.string().trim().max(300).allow("").default(""),

  description: Joi.string().trim().min(100).required().messages({
    "string.min":
      "Description must be at least 100 characters — give students a real overview",
    "string.empty": "Course description is required",
    "any.required": "Course description is required",
  }),

  category: Joi.string()
    .valid(
      "Design",
      "Development",
      "Marketing",
      "Business",
      "Data Science",
      "Photography",
      "Music",
      "Health",
    )
    .required()
    .messages({
      "any.only": "Please select a valid category",
      "any.required": "Category is required",
    }),

  subcategory: Joi.string().trim().allow("").default(""),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced", "all")
    .default("all"),

  language: Joi.string().trim().default("English (US)"),

  tags: Joi.array().items(Joi.string().trim().max(50)).default([]),
  thumbnail: Joi.string().allow("").default(""),

  previewVideo: Joi.string()
    .uri({ allowRelative: false })
    .allow("")
    .default("")
    .messages({
      "string.uri": "Preview video must be a valid URL (YouTube, Vimeo, etc.)",
    }),

  sections: Joi.array().items(sectionSchema).min(1).required().messages({
    "array.min": "Course must have at least one section",
    "any.required": "Curriculum sections are required",
  }),

  learningOutcomes: Joi.array()
    .items(Joi.string().trim().min(5).max(300))
    .min(1)
    .required()
    .messages({
      "array.min": "Please add at least one learning outcome",
      "any.required": "Learning outcomes are required",
    }),

  prerequisites: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().max(300)),
      Joi.string().allow("").max(2000),
    )
    .default([]),

  targetAudience: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().max(300)),
      Joi.string().allow("").max(2000),
    )
    .default([]),

  requirements: Joi.array().items(Joi.string().trim().max(300)).default([]),

  resources: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().max(200).required(),
        size: Joi.string().allow("").default(""),
        url: Joi.string().allow("").default(""),
      }),
    )
    .default([]),

  providesCertificate: Joi.boolean().default(false),
  allowLateAccess: Joi.boolean().default(true),
  showInstructorProfile: Joi.boolean().default(true),

  status: Joi.string().valid("draft", "active").default("active"),
});

const updateCourseSchema = createCourseSchema.fork(
  ["title", "description", "category", "sections", "learningOutcomes"],
  (field) => field.optional(),
);

module.exports = { createCourseSchema, updateCourseSchema };
