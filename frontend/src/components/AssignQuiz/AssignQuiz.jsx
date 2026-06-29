import { useNavigate, useParams } from "react-router-dom";
import "./AssignQuiz.css";
import { useState, useEffect } from "react";
import quizService from "../../services/quizService";
import { toast } from "sonner";
import {
  X,
  FileQuestion,
  Clock,
  Users,
  Plus,
  Lock,
  ChevronRight,
} from "lucide-react";
import CreateQuizForm from "../../../forms/CreateQuizForm/CreateQuizForm";

function getStatusStyle(currentStatus) {
  switch (currentStatus) {
    case "opened":
      return { bg: "bg-green-100", text: "text-green-600" };
    case "scheduled":
      return { bg: "bg-amber-100", text: "text-amber-600" };
    case "draft":
      return { bg: "bg-gray-100", text: "text-gray-500" };
    case "closed":
      return { bg: "bg-red-100", text: "text-red-500" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500" };
  }
}

function getStatusLabel(currentStatus) {
  switch (currentStatus) {
    case "opened":
      return "Open";
    case "scheduled":
      return "Scheduled";
    case "draft":
      return "Draft";
    case "closed":
      return "Closed";
    default:
      return currentStatus;
  }
}

const AssignQuiz = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [quizForm, setQuizForm] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await quizService.getQuizzes({ classroomId });
        setQuizzes(res.data || []);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error("Failed to load classroom quizzes");
      } finally {
        setLoadingQuizzes(false);
      }
    }
    if (classroomId) fetchQuizzes();
  }, [classroomId]);

  const handleUnassign = async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      toast.success("Quiz removed");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to remove quiz");
    }
  };
  const handleOpenPicker = async () => {
    setShowPicker(true);
    setLoadingAll(true);
    try {
      const res = await quizService.getQuizzes();
      const assignedIds = quizzes.map((q) => q._id);
      setAllQuizzes(
        (res.data || []).filter((q) => !assignedIds.includes(q._id)),
      );
    } catch {
      toast.error("Failed to load quizzes");
    } finally {
      setLoadingAll(false);
    }
  };

  const handleAssignExisting = async (quiz) => {
    try {
      await quizService.updateQuiz(quiz._id, { classroomId });
      setQuizzes((prev) => [{ ...quiz, classroom: classroomId }, ...prev]);
      setShowPicker(false);
      toast.success("Quiz assigned!");
    } catch {
      toast.error("Failed to assign quiz");
    }
  };

  const handleBrowseQuizzes = () => {
    navigate("/instructor/quizzes");
  };

  return (
    <>
      {quizForm && (
        <CreateQuizForm
          classroomId={classroomId}
          onClose={() => setQuizForm(false)}
          onSuccess={(quiz) => {
            setQuizzes((prev) => [quiz, ...prev]);
            setQuizForm(false);
          }}
        />
      )}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center pt-20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg text-(--dark-navy)">
                Assign Existing Quiz
              </h2>
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
              {loadingAll ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  Loading quizzes...
                </p>
              ) : allQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">
                    No other quizzes available.
                  </p>
                  <button
                    onClick={() => {
                      setShowPicker(false);
                      setQuizForm(true);
                    }}
                    className="mt-3 text-sm text-(--electric) font-semibold"
                  >
                    Create a new one instead
                  </button>
                </div>
              ) : (
                allQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    onClick={() => handleAssignExisting(quiz)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-(--electric) hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-sm text-(--dark-navy)">
                        {quiz.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {quiz.timeLimit} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileQuestion size={11} />{" "}
                          {quiz.questionCount || quiz.questions?.length || 0}{" "}
                          questions
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyle(quiz.currentStatus || quiz.status).bg} ${getStatusStyle(quiz.currentStatus || quiz.status).text}`}
                    >
                      {getStatusLabel(quiz.currentStatus || quiz.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <section className="assign-quiz w-full min-h-screen flex flex-col p-3">
        <div className="mb-4">
          <h1 className="text-[2em] font-bold text-(--dark-navy)">
            Classroom Quizzes
          </h1>
          <p className="mt-2 my-1 mx-2 text-sm max-w-md text-gray-400">
            Create and manage quizzes for this classroom. Students will see
            published quizzes on their classroom page.
          </p>
        </div>

        {loadingQuizzes ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading quizzes...</p>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => {
                const statusStyle = getStatusStyle(
                  quiz.currentStatus || quiz.status,
                );
                const statusLabel = getStatusLabel(
                  quiz.currentStatus || quiz.status,
                );
                const isLocked = quiz.currentStatus === "scheduled";

                return (
                  <div
                    key={quiz._id}
                    onClick={() =>
                      navigate("/instructor/quizzez", {
                        state: { highlightId: quiz._id },
                      })
                    }
                    className="rounded-xl border border-gray-200 shadow-md p-5 bg-white flex flex-col gap-3 cursor-pointer hover:border-(--electric) transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusLabel}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassign(quiz._id);
                        }}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        title="Remove quiz"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {isLocked ? (
                          <Lock size={15} className="text-amber-500" />
                        ) : (
                          <FileQuestion
                            size={15}
                            className="text-(--royal-blue)"
                          />
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-(--dark-navy) line-clamp-1">
                        {quiz.title}
                      </h3>
                    </div>

                    {quiz.description && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-auto text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {quiz.timeLimit} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion size={11} /> {quiz.questions?.length || 0}{" "}
                        questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {quiz.maxAttempts} attempt
                        {quiz.maxAttempts !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {quiz.startDate && (
                      <p className="text-xs text-amber-600 font-semibold">
                        Opens{" "}
                        {new Date(quiz.startDate).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {quiz.dueDate && (
                      <p className="text-xs text-red-400 font-semibold">
                        Closes{" "}
                        {new Date(quiz.dueDate).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleOpenPicker}
                className="rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-sm text-gray-400 font-semibold hover:bg-gray-50 transition-colors min-h-[160px] cursor-pointer"
              >
                <FileQuestion size={20} />
                Assign Existing
              </button>

              <button
                onClick={() => setQuizForm(true)}
                className="rounded-xl border-2 border-dashed  border-(--electric) flex flex-col items-center justify-center gap-2 text-sm text-(--electric) font-semibold hover:bg-blue-50 transition-colors min-h-[160px] cursor-pointer"
              >
                <Plus size={20} />
                Add Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-(--electric) bg-white">
            <div className="w-25 h-25 rounded-full flex items-center justify-center mb-5 bg-gray-200">
              <FileQuestion
                size={50}
                color="var(--royal-blue)"
                strokeWidth={1.8}
              />
            </div>

            <h2 className="text-[1.8em] font-bold mb-2 text-(--dark-navy)">
              No quizzes assigned yet
            </h2>
            <p className="text-sm text-center max-w-xs mb-10 text-gray-400">
              Your classroom currently has no quizzes. Create a new one or
              assign an existing quiz to this class.
            </p>

            <div className="flex gap-4 w-full max-w-2xl min-h-[30vh]">
              
              <div className="flex-1 rounded-xl p-5 flex flex-col gap-3 border-1 border-gray-200 shadow-md w-full h-full">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-(--electric-pastel)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--electric)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold text-sm mb-1"
                    style={{ color: "#1e293b" }}
                  >
                    Assign Existing
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400 px-1">
                    Select from your previously created quizzes library.
                  </p>
                </div>
                <button
                  onClick={handleOpenPicker}
                  className="text-xs font-semibold flex items-center gap-1 mt-1 w-fit text-(--electric) px-3 py-2 rounded-full cursor-pointer hover:bg-gray-100"
                >
                  Browse Quizzes
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="flex-1 rounded-xl p-5 flex flex-col gap-3 border-1 border-gray-200 shadow-md w-full h-full">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-(--violete-pastel)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--bright-violet)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold text-sm mb-1"
                    style={{ color: "#1e293b" }}
                  >
                    Create New
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400 px-1">
                    Build a brand new quiz specifically for this classroom.
                  </p>
                </div>
                <button
                  onClick={() => setQuizForm(true)}
                  className="text-xs font-semibold flex items-center gap-1 mt-1 w-fit text-(--bright-violet) cursor-pointer px-3 py-2 rounded-full hover:bg-gray-100"
                >
                  Create Quiz
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default AssignQuiz;
