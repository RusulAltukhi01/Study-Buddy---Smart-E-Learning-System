import { CircleCheck, CircleChevronRight, Edit } from "lucide-react";
import "./CurriculumCard.css";
import { useEffect, useRef, useState } from "react";

const CurriculumCard = ({ course, index, highlighted, readOnly = false }) => {
  const cardRef = useRef(null);
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  if (!course) return null;

  return (
    <div
      ref={cardRef}
      className={`curriculum-card w-[80%] ${expand ? "h-fit" : "min-h-[35vh]"} p-10 bg-white mb-6 transition-all duration-300`}
      style={
        highlighted
          ? {
              border: "2px solid var(--electric-dark)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.15)",
              transition: "border 0.5s ease, box-shadow 0.5s ease",
            }
          : {
              border: "1px solid var(--color-gray-200)",
              transition: "border 0.5s ease, box-shadow 0.5s ease",
            }
      }
    >
      <header className="curriculum-card-header w-full flex justify-between items-center">
        <div className="curriculum-header-info flex items-center gap-x-3">
          <span className="curriculum-number w-[50px] h-[50px] rounded-lg bg-(--electric-pastel) p-4 font-[800] text-[1.4em] text-center flex justify-center items-center">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h1 className="curriculum-title font-bold tracking-wider text-(--dark-navy) text-[1.5em]">
            {course.title}
          </h1>
        </div>

        <nav className="curriculum-header-nav flex items-center gap-x-3">
          <div className="flex flex-col justify-center items-center">
            <span className="uppercase font-semibold tracking-[1px] bg-blue-100 px-3 py-1 rounded-full text-(--royal-blue) text-sm">
              {course.level}
            </span>
            <span className="text-xs text-gray-400 tracking-wider italic ">
              {course.category}
            </span>
          </div>
          <div className="curriculum-header-btns flex items-center justify-between gap-x-3">
            {!readOnly && (
              <span title="Edit curriculum" className="cursor-pointer">
                <Edit />
              </span>
            )}
            <span
              onClick={() => setExpand((prev) => !prev)}
              title="Show curriculum details"
              className="cursor-pointer transition-transform duration-300"
              style={{ transform: expand ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              <CircleChevronRight color="var(--dark-navy)" />
            </span>
          </div>
        </nav>
      </header>

      <div className="curriculum-content mt-6 grid grid-cols-[1fr_1.3fr] gap-8">
        {/* LEFT */}
        <div className="curriculum-left flex flex-col gap-6">
          <div>
            <h3 className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-3">
              Learning Objectives
            </h3>
            <ul className="flex flex-col gap-3 text-sm mx-2">
              {course.learningOutcomes?.map((outcome, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 font-semibold text-(--electric-dark)"
                >
                  <span className="text-(--electric-dark) mt-[2px] ">
                    <CircleCheck />
                  </span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                course.status === "active"
                  ? "bg-green-100 text-green-700"
                  : course.status === "draft"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {course.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="curriculum-right">
          <h3 className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-4">
            Curriculum Content
          </h3>
          <div className="flex flex-col gap-3">
            {course.sections?.map((section, si) => (
              <div
                key={si}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white"
              >
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">⋮⋮</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      {section.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {section.lectures?.length} lecture
                      {section.lectures?.length !== 1 ? "s" : ""} • Week{" "}
                      {section.weekNumber}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {expand && (
        <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col gap-8">
          
          <div>
            <h3 className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-4">
              Media & Assets
            </h3>
            <div className="grid grid-cols-[1fr_1.3fr] gap-6">

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Preview Video</p>
                  {course.previewVideo ? (
                    <a
                      href={course.previewVideo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-500 underline break-all"
                    >
                      {course.previewVideo}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 w-full h-40 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                      No preview video
                    </span>
                  )}
                </div>

                {course.resources?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      Course Resources
                    </p>
                    <div className="flex flex-col gap-2">
                      {course.resources.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <span className="text-sm text-gray-700 flex-1">
                            {r.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {r.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        
          <div>
            <h3 className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-4">
              Curriculum Builder
            </h3>
            <div className="flex flex-col gap-4">
              {course.sections?.map((section, si) => (
                <div
                  key={si}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                 
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="w-6 h-6 rounded-md bg-(--electric-pastel) text-xs font-bold flex items-center justify-center text-(--royal-blue)">
                      S{si + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-800 flex-1">
                      {section.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      Week {section.weekNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {section.lectures?.length} lecture
                      {section.lectures?.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                 
                  <div className="flex flex-col divide-y divide-gray-100">
                    {section.lectures?.map((lecture, li) => (
                      <div
                        key={li}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-mono w-5">
                            {li + 1}.
                          </span>
                          <span className="text-sm text-gray-700">
                            {lecture.title}
                          </span>
                          {lecture.isPreview && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                              Preview
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {lecture.resources?.length > 0 && (
                            <span className="text-xs text-gray-400">
                              {lecture.resources.length} resource
                              {lecture.resources.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {lecture.videoDuration > 0 && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                              {lecture.videoDuration} min
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

        
            {course.duration && (
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col justify-center items-center">
                  <span className="text-xs text-gray-400">Total Duration</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {course.duration.totalHours}h {course.duration.totalMinutes}
                    m
                  </span>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <span className="text-xs text-gray-400">Total Lectures</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {course.duration.totalLectures}
                  </span>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <span className="text-xs text-gray-400">Sections</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {course.sections?.length}
                  </span>
                </div>
              </div>
            )}
          </div>

        
          {(course.prerequisites?.length > 0 ||
            course.targetAudience?.length > 0) && (
            <div className="grid grid-cols-2 gap-6">
              {course.prerequisites?.length > 0 && (
                <div>
                  <h3 className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-3">
                    Prerequisites
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {course.prerequisites.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-(--electric) "
                      >
                        <span className="text-gray-300 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {course.targetAudience?.length > 0 && (
                <div>
                  <h3 className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-3">
                    Target Audience
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {course.targetAudience.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-(--electric)"
                      >
                        <span className="text-gray-300 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurriculumCard;
