import { useEffect, useState, useMemo } from "react";
import { BookOpen, CircleCheck, CircleChevronRight, Layers, Clock, Award, BookOpenCheck } from "lucide-react";
import { toast } from "sonner";
import courseService from "../../services/courseService";
import classroomService from "../../services/classroomService";


const StudentCourseCard = ({ course, index }) => {
  const [expand, setExpand] = useState(false);

  if (!course) return null;

  return (
    <div
      className="w-full bg-white border border-gray-100 border-l-4 border-l-emerald-600 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <header className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-xl bg-emerald-50 font-black text-lg text-emerald-700 flex justify-center items-center flex-shrink-0" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h2 className="font-extrabold text-gray-800 text-lg tracking-tight leading-snug">
              {course.title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide">
              {course.category || "General Academic"}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <span className="uppercase text-[11px] font-bold tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
            {course.level || "Standard"}
          </span>
          <button
            type="button"
            onClick={() => setExpand((prev) => !prev)}
            aria-label="Toggle details view"
            className="p-1.5 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
            style={{ transform: expand ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            <CircleChevronRight size={22} />
          </button>
        </nav>
      </header>

      <div className={`transition-all duration-300 overflow-hidden ${expand ? "max-h-[2000px] border-t border-gray-50" : "max-h-0"}`}>
        <div className="p-6 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-6">
          
        
          <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-gray-100">
            <div>
              <h3 className="uppercase text-[10px] tracking-widest text-gray-400 font-bold mb-3 flex items-center gap-1.5">
                <Layers size={12} className="text-emerald-600" /> Learning Objectives
              </h3>
              {course.learningOutcomes?.length > 0 ? (
                <ul className="flex flex-col gap-2.5 text-sm">
                  {course.learningOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2.5 font-medium text-gray-600">
                      <CircleCheck size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No specific targets provided.</p>
              )}
            </div>

            <div className="mt-auto pt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-emerald-100 text-emerald-800">
                {(course.status || "Published").toUpperCase()}
              </span>
            </div>
          </div>

         
          <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-100">
            <h3 className="uppercase text-[10px] tracking-widest text-gray-400 font-bold mb-1">
              Curriculum Summary
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-56 pr-1">
              {course.sections?.map((section, si) => (
                <div
                  key={si}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-700 truncate">
                      {section.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {section.lectures?.length || 0} lecture{(section.lectures?.length !== 1) ? "s" : ""} • Week {section.weekNumber || si + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

       
        <div className="px-6 pb-6 pt-2 bg-gray-50/50 flex flex-col gap-4">
          <h3 className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">
            Detailed Content Modules
          </h3>
          <div className="flex flex-col gap-3">
            {course.sections?.map((section, si) => (
              <div key={si} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-800/5 border-b border-gray-100">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                      S{si + 1}
                    </span>
                    {section.title}
                  </span>
                  <span className="text-[11px] text-emerald-700/80 font-semibold">
                    Week {section.weekNumber || si + 1}
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-gray-50">
                  {section.lectures?.map((lecture, li) => (
                    <div key={li} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-400 font-mono w-5 flex-shrink-0">
                          {li + 1}.
                        </span>
                        <span className="text-xs font-medium text-gray-600 truncate">
                          {lecture.title}
                        </span>
                        {lecture.isPreview && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Preview
                          </span>
                        )}
                      </div>
                      {lecture.videoDuration > 0 && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {lecture.videoDuration} min
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        
          {course.duration && (
            <div className="flex items-center gap-6 mt-2 pt-4 border-t border-gray-100 text-center">
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Duration</span>
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1 mt-0.5 justify-center">
                  <Clock size={12} className="text-emerald-600" />
                  {course.duration.totalHours || 0}h {course.duration.totalMinutes || 0}m
                </span>
              </div>
              <div className="border-l border-gray-200 pl-6">
                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Lectures</span>
                <span className="text-xs font-bold text-gray-700 block mt-0.5">
                  {course.duration.totalLectures || 0}
                </span>
              </div>
              <div className="border-l border-gray-200 pl-6">
                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sections</span>
                <span className="text-xs font-bold text-gray-700 block mt-0.5">
                  {course.sections?.length || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const StudentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCourses() {
      try {
        const classroomsRes = await classroomService.getMyClassrooms();
        const enrolled = classroomsRes?.data?.enrolled || [];

        if (enrolled.length === 0) {
          if (isMounted) setLoading(false);
          return;
        }

        const results = await Promise.allSettled(
          enrolled.map((c) => courseService.getCoursesByClassroom(c._id)),
        );

        const seen = new Set();
        const all = [];

        results.forEach((r) => {
          if (r.status === "fulfilled") {
            (r.value?.data || []).forEach((course) => {
              if (course && !seen.has(course._id)) {
                seen.add(course._id);
                all.push(course);
              }
            });
          }
        });

        if (isMounted) {
          setCourses(all);
        }
      } catch (err) {
        console.error("Fetch courses pipeline error:", err);
        toast.error("Failed to load your assigned courses");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);


  const courseMetrics = useMemo(() => {
    let totalLectures = 0;
    let totalSections = 0;

    courses.forEach(c => {
      totalSections += c.sections?.length || 0;
      if (c.duration?.totalLectures) {
        totalLectures += c.duration.totalLectures;
      } else {
        c.sections?.forEach(s => totalLectures += s.lectures?.length || 0);
      }
    });

    return { totalLectures, totalSections };
  }, [courses]);

  return (
    <main className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8" aria-label="Curriculum Overview Hub">
      
   
      <div className="rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46]">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none bg-radial-gradient from-emerald-200 to-transparent translate-x-[30%] -translate-y-[30%]" />
        <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none bg-radial-gradient from-teal-200 to-transparent translate-y-[50%]" />

        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
            Curriculum Hub
          </span>
          <h1 className="text-white text-xl sm:text-2xl font-extrabold italic leading-tight">My Courses</h1>
          <p className="text-emerald-100 opacity-90 text-[13px]">Access your study materials and tracking guidelines.</p>

          {!loading && courses.length > 0 && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {[
                { label: "Curriculums", value: courses.length, color: "text-white" },
                { label: "Modules", value: courseMetrics.totalSections, color: "text-emerald-300" },
                { label: "Lectures", value: courseMetrics.totalLectures, color: "text-emerald-300" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                  <span className="text-emerald-100/70 text-xs">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-36 rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <BookOpen size={24} className="text-gray-400" />
          </div>
          <p className="text-base font-bold text-gray-700">No courses assigned yet</p>
          <p className="text-sm text-gray-400 mt-1 max-w-md">
            Your instructor hasn't assigned any courses to your current classrooms yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course, i) => (
            <StudentCourseCard key={course._id} course={course} index={i} />
          ))}
        </div>
      )}
    </main>
  );
};

export default StudentCoursesPage;