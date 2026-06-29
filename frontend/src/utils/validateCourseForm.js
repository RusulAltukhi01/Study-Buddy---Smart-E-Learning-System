export function validateCourseForm(data) {
  const errors = {};

  //Basic info
  if (!data.title?.trim()) {
    errors.title = "Course title is required";
  } else if (data.title.trim().length < 10) {
    errors.title = "Title must be at least 10 characters";
  } else if (data.title.trim().length > 200) {
    errors.title = "Title cannot exceed 200 characters";
  }

  if (data.description && data.description.trim().length > 0 && data.description.trim().length < 100) {
    errors.description = "Description must be at least 100 characters (or leave it for later)";
  }

  if (!data.category) {
    errors.category = "Please select a category";
  }

  if (data.previewVideo && data.previewVideo.trim()) {
    try {
      new URL(data.previewVideo.trim());
    } catch {
      errors.previewVideo = "Preview video must be a valid URL";
    }
  }

  // Curriculum
  if (!data.sections || data.sections.length === 0) {
    errors.sections = "Add at least one section to your course";
  } else {
    data.sections.forEach((section, si) => {
      if (!section.title?.trim()) {
        errors[`sections[${si}].title`] = "Section title is required";
      }
      if (!section.lectures || section.lectures.length === 0) {
        errors[`sections[${si}].lectures`] = "Each section needs at least one lecture";
      } else {
        section.lectures.forEach((lecture, li) => {
          if (!lecture.title?.trim()) {
            errors[`sections[${si}].lectures[${li}].title`] = "Lecture title is required";
          }
        });
      }
    });
  }


  if (!data.learningOutcomes || data.learningOutcomes.length < 1) {
    errors.learningOutcomes = "Add at least one learning outcome";
  }

  return errors; 
}


export function isStepValid(step, data) {
  const errors = validateCourseForm(data);

  const stepFields = {
    1: ["title", "description", "category"],
    2: ["previewVideo"], 
    3: ["sections", ...Object.keys(errors).filter((k) => k.startsWith("sections"))],
    4: ["learningOutcomes"],
  };

  return !stepFields[step]?.some((field) => errors[field]);
}