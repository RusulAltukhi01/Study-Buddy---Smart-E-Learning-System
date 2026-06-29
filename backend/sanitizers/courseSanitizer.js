function sanitizeThumbnail(url) {
  if (!url || url.startsWith("blob:")) return "";
  return url.trim();
}

function sanitizeSections(sections = []) {
  return sections.map((section, sectionIndex) => {
    const { _id, lectures = [], ...sectionRest } = section;

    const sanitizedLectures = lectures.map((lecture, lectureIndex) => {
      const { _id: lecId, resources = [], ...lectureRest } = lecture;

      return {
        ...lectureRest,

        videoDuration: Number(lecture.videoDuration) || 0,
        resources: resources.map((r) => ({
          name: r.name?.trim() || "",
          url: r.url?.trim() || "",
          type: r.type?.trim() || "",
          size: parseFloat(r.size) || 0,
        })),
        order: lectureIndex,
        isPreview: Boolean(lecture.isPreview),
      };
    });

    return {
      ...sectionRest,
      title: sectionRest.title?.trim(),
      description: sectionRest.description?.trim() || "",
      weekNumber: Number(sectionRest.weekNumber) || sectionIndex + 1,
      order: sectionIndex,
      lectures: sanitizedLectures,
    };
  });
}

function computeDuration(sections = []) {
  let totalMinutesRaw = 0;
  let totalLectures = 0;

  for (const section of sections) {
    for (const lecture of section.lectures || []) {
      totalMinutesRaw += Number(lecture.videoDuration) || 0;
      totalLectures += 1;
    }
  }

  return {
    totalHours: Math.floor(totalMinutesRaw / 60),
    totalMinutes: totalMinutesRaw % 60,
    totalLectures,
  };
}

function textToArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => v.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Main sanitizer — call this after Joi validation passes.
 * Receives the Joi-validated value (already stripped of unknown keys).
 *
 * @param {Object} validated - output from Joi's schema.validate()
 * @param {string} instructorId - injected from req.user, never from client
 * @returns {Object} clean DTO
 */
function sanitizeCourseData(validated, instructorId) {
  try {
    const sanitizedSections = sanitizeSections(validated.sections);

    return {
      title: validated.title.trim(),
      subtitle: validated.subtitle?.trim() || "",
      description: validated.description.trim(),
      category: validated.category,
      subcategory: validated.subcategory?.trim() || "",
      level: validated.level,
      language: validated.language,
      tags: (validated.tags || []).map((t) => t.trim()).filter(Boolean),

      thumbnail: sanitizeThumbnail(validated.thumbnail),
      previewVideo: validated.previewVideo?.trim() || "",

      sections: sanitizedSections,
      duration: computeDuration(sanitizedSections),

      learningOutcomes: validated.learningOutcomes
        .map((o) => o.trim())
        .filter(Boolean),
      prerequisites: textToArray(validated.prerequisites),
      targetAudience: textToArray(validated.targetAudience),
      requirements: textToArray(validated.requirements || []),
      resources: (validated.resources || []).map((r) => ({
        name: r.name?.trim() || "",
        size: r.size || "",
        url: r.url?.trim() || "",
      })),
      
      providesCertificate: Boolean(validated.providesCertificate),
      allowLateAccess: Boolean(validated.allowLateAccess),

      instructor: instructorId,
      status: validated.status || "active",
      moderationStatus: "pending",
    };
  } catch (e) {
    console.error("sanitizeCourseData internal error:", e.message, e.stack);
    throw e;
  }

  
}

module.exports = { sanitizeCourseData };
