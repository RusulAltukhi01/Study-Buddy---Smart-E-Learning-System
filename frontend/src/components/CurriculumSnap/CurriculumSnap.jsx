
import "./CurriculumSnap.css";

import { ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_STYLE = {
  active: { bg: "bg-green-100", text: "text-green-700" },
  draft:     { bg: "bg-amber-100",   text: "text-amber-700"   },
  archived:  { bg: "bg-gray-100",    text: "text-gray-500"    },
};

const CurriculumSnapshot = ({ courses = [], loading }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <h2 className="font-bold text-(--dark-navy) text-lg">My Curricula</h2>
        <button
          onClick={() => navigate("/instructor/courses")}
          className="flex items-center gap-1 text-xs font-semibold text-(--electric) hover:underline cursor-pointer"
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 rounded w-44" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
              <div className="w-16 h-5 bg-gray-100 rounded-full" />
            </div>
          ))
        ) : courses.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No curricula yet
          </div>
        ) : (
          courses.slice(0, 5).map((course) => {
            const style = STATUS_STYLE[course.status] || STATUS_STYLE.draft;
            const classroomCount = course.classrooms?.length || 0;
            return (
              <div
                key={course._id}
                onClick={() => navigate("/instructor/courses")}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-(--electric-pastel) flex items-center justify-center flex-shrink-0">
                  <BookOpen size={15} className="text-(--royal-blue)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400">
                    {classroomCount} classroom{classroomCount !== 1 ? "s" : ""} • {course.category || "General"}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${style.bg} ${style.text}`}>
                  {course.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CurriculumSnapshot;