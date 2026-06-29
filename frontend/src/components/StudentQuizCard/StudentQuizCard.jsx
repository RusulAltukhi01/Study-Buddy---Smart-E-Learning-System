import "./StudentQuizCard.css";

import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, FileQuestion, Lock } from "lucide-react";

const StudentQuizCard = ({ quiz }) => {
  const navigate = useNavigate();

  const now = new Date();
  const isLocked = quiz.startDate && new Date(quiz.startDate) > now;
  const isClosed =
    (quiz.dueDate && new Date(quiz.dueDate) < now) ||
    quiz.currentStatus === "closed";
  const hasSubmitted = quiz.hasSubmitted ?? false;
  const isOpen =
    !isLocked && !isClosed && !hasSubmitted && quiz.currentStatus === "opened";

  return (
    <section className="flex flex-col py-2">
      <div
        onClick={() => isOpen && navigate(`/student/quizzes/${quiz._id}`)}
        className={`bg-gray-50 border-1 border-gray-200 rounded-lg shadow-sm flex items-center justify-between gap-4 px-5 py-4 w-[95%]  transition-all ${
          hasSubmitted || isClosed
            ? "opacity-60 cursor-not-allowed"
            : isLocked
              ? "bg-amber-50 cursor-default"
              : "hover:bg-gray-50 cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              hasSubmitted
                ? "bg-green-100"
                : isClosed
                  ? "bg-gray-100"
                  : isLocked
                    ? "bg-amber-100"
                    : "bg-teal-50"
            }`}
          >
            {hasSubmitted ? (
              <CheckCircle2 size={15} className="text-green-500" />
            ) : isLocked ? (
              <Lock size={15} className="text-amber-500" />
            ) : (
              <FileQuestion
                size={15}
                className={isClosed ? "text-gray-400" : "text-teal-500"}
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-sm text-(--dark-navy) truncate">
              {quiz.title}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={11} /> {quiz.timeLimit} min
              </span>
              <span className="text-xs text-gray-400">
                {quiz.questions?.length || 0} questions
              </span>
              {hasSubmitted && quiz.lastScore !== null && (
                <span className="text-xs text-green-600 font-semibold">
                  Score: {quiz.lastScore}%
                </span>
              )}
              {isLocked && quiz.startDate && (
                <span className="text-xs text-amber-600 font-semibold">
                  Opens{" "}
                  {new Date(quiz.startDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {isOpen ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/student/quizzes/${quiz._id}`);
            }}
            className="text-xs font-bold px-4 py-1.5 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors cursor-pointer flex-shrink-0"
          >
            Start →
          </button>
        ) : (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
              hasSubmitted
                ? "bg-green-100 text-green-600"
                : isClosed
                  ? "bg-gray-100 text-gray-400"
                  : isLocked
                    ? "bg-amber-100 text-amber-600"
                    : "bg-teal-50 text-teal-600"
            }`}
          >
            {hasSubmitted
              ? "✓ Submitted"
              : isClosed
                ? "Closed"
                : isLocked
                  ? "Scheduled"
                  : "Start →"}
          </span>
        )}
      </div>
      
    </section>
  );
};

export default StudentQuizCard;
