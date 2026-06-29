import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  FileQuestion,
  Star,
  AlertCircle,
  Plus,
  Sparkles,
  BarChart2,
  Zap,
} from "lucide-react";
import quizService from "../../services/quizService";


const getDaysLeft = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const QuizCard = ({ quiz, showClassroom = false, isPersonal = false }) => {
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);

  // Structural evaluation flags
  const isLocked = quiz.startDate && new Date(quiz.startDate) > now;
  const isClosed = (quiz.dueDate && new Date(quiz.dueDate) < now) || quiz.currentStatus === "closed";
  const hasSubmitted = quiz.hasSubmitted ?? false;
  const isOpen = !isLocked && !isClosed && !hasSubmitted && quiz.currentStatus === "opened";
  const daysLeft = getDaysLeft(quiz.dueDate);

  
  const accentBorder = hasSubmitted
    ? "border-l-emerald-500"
    : isClosed
    ? "border-l-gray-300"
    : isLocked
    ? "border-l-amber-400"
    : isPersonal
    ? "border-l-violet-400"
    : "border-l-emerald-400";

  const handleActionClick = useCallback(() => {
    if (isPersonal || isOpen) {
      navigate(`/student/quizzes/${quiz._id}`);
    }
  }, [navigate, quiz._id, isPersonal, isOpen]);

  return (
    <article
      className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${accentBorder} shadow-sm hover:shadow-md transition-all overflow-hidden ${
        isClosed || hasSubmitted ? "opacity-80" : ""
      }`}
      aria-label={`Quiz: ${quiz.title}`}
    >
      <div className="p-5 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {isPersonal && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-violet-50 text-violet-600">
                MY QUIZ
              </span>
            )}
            {hasSubmitted && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                SUBMITTED
              </span>
            )}
            {isLocked && !hasSubmitted && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                SCHEDULED
              </span>
            )}
            {isClosed && !hasSubmitted && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                CLOSED
              </span>
            )}
            {isOpen && !isPersonal && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                OPEN
              </span>
            )}
            {quiz.questions?.length > 0 && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                {quiz.questions.length} QS
              </span>
            )}
          </div>

          {isPersonal ? (
            <button
              type="button"
              onClick={handleActionClick}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors flex-shrink-0"
            >
              Take Quiz →
            </button>
          ) : isOpen ? (
            <button
              type="button"
              onClick={handleActionClick}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex-shrink-0"
            >
              Start →
            </button>
          ) : hasSubmitted ? (
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <CheckCircle2 size={13} /> View Result
            </button>
          ) : (
            <span
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl flex-shrink-0 ${
                isLocked ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
              }`}
            >
              {isLocked ? <Lock size={13} /> : <AlertCircle size={13} />}
              {isLocked ? "Locked" : "Closed"}
            </span>
          )}
        </header>

        {showClassroom && quiz.classroom?.name && (
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full w-fit mb-2 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            {quiz.classroom.name}
          </p>
        )}

        <h2 className="text-base font-bold text-gray-800 mb-1 leading-snug">{quiz.title}</h2>

        {quiz.description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{quiz.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {quiz.timeLimit} min
          </span>
          <span className="flex items-center gap-1.5">
            <FileQuestion size={12} />
            {hasSubmitted
              ? "Submitted"
              : isClosed
              ? "Closed"
              : isLocked
              ? `Opens ${formatDate(quiz.startDate)}`
              : daysLeft === null
              ? "No deadline"
              : daysLeft === 0
              ? "Due Today"
              : daysLeft < 0
              ? `${Math.abs(daysLeft)}d overdue`
              : `Due in ${daysLeft} days`}
          </span>
          <span className="flex items-center gap-1.5">
            <AlertCircle size={12} />
            {quiz.attemptsMade ?? 0}/{isPersonal ? "∞" : quiz.maxAttempts || 0} attempts
          </span>
        </div>

        {hasSubmitted && quiz.lastScore !== undefined && quiz.lastScore !== null && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={12} />
              Score: {quiz.lastScore}%
            </p>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Star size={10} /> Completed
            </span>
          </div>
        )}
      </div>
    </article>
  );
};


const TABS = ["All Quizzes", "Created Quizzes", "Open", "Submitted", "Closed"];

const StudentQuizzesPage = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState([]);
  const [personalQuizzes, setPersonalQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Quizzes");

  useEffect(() => {
    let isMounted = true;
    async function fetchQuizzes() {
      try {
        setLoading(true);
        const params = classroomId ? { classroomId } : {};
        const [classroomQuizzesRes, personalQuizzesRes] = await Promise.all([
          quizService.getStudentQuizzes(params),
          quizService.getMyPersonalQuizzes(),
        ]);

        if (isMounted) {
          setQuizzes(classroomQuizzesRes?.data || []);
          setPersonalQuizzes(personalQuizzesRes?.data || []);
        }
      } catch (err) {
        console.error("Failed to load assessments:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchQuizzes();

    return () => {
      isMounted = false;
    };
  }, [classroomId]);

  
  const counts = useMemo(() => {
    return {
      "All Quizzes": quizzes.length,
      "Created Quizzes": personalQuizzes.length,
      Open: quizzes.filter((q) => q.currentStatus === "opened" && !q.hasSubmitted).length,
      Submitted: quizzes.filter((q) => q.hasSubmitted).length,
      Closed: quizzes.filter((q) => q.currentStatus === "closed").length,
    };
  }, [quizzes, personalQuizzes]);

 
  const filteredQuizzes = useMemo(() => {
    switch (activeTab) {
      case "Created Quizzes":
        return personalQuizzes;
      case "Open":
        return quizzes.filter((q) => q.currentStatus === "opened" && !q.hasSubmitted);
      case "Submitted":
        return quizzes.filter((q) => q.hasSubmitted);
      case "Closed":
        return quizzes.filter((q) => q.currentStatus === "closed");
      default:
        return quizzes;
    }
  }, [activeTab, quizzes, personalQuizzes]);

  const completionRate = useMemo(() => {
    if (!quizzes.length) return 0;
    return Math.round((counts.Submitted / quizzes.length) * 100);
  }, [quizzes.length, counts.Submitted]);


  const handleCreateQuizRedirect = useCallback(() => navigate("/quiz"), [navigate]);


  const summaryCards = useMemo(() => [
    { icon: BookOpen, bg: "bg-blue-50", iconColor: "text-blue-500", label: "Total Quizzes", value: quizzes.length },
    { icon: Zap, bg: "bg-emerald-50", iconColor: "text-emerald-500", label: "Open Now", value: counts.Open },
    { icon: CheckCircle2, bg: "bg-emerald-50", iconColor: "text-emerald-500", label: "Submitted", value: counts.Submitted },
    { icon: BarChart2, bg: "bg-violet-50", iconColor: "text-violet-500", label: "Completion", value: `${completionRate}%` },
  ], [quizzes.length, counts.Open, counts.Submitted, completionRate]);

  return (
    <main className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8" aria-label="Quizzes Dashboard">
    
      <div className="rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46]">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none bg-radial-gradient from-emerald-200 to-transparent translate-x-[30%] -translate-y-[30%]" />
        <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none bg-radial-gradient from-teal-200 to-transparent translate-y-[50%]" />

        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
            Assessments
          </span>
          <h1 className="text-white text-xl sm:text-2xl font-extrabold italic leading-tight">Your Quizzes</h1>
          <p className="text-emerald-100 opacity-90 text-[13px]">Track your quiz progress and test your knowledge.</p>

          {!loading && quizzes.length > 0 && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {[
                { label: "Total", value: quizzes.length, color: "text-white", bg: "bg-white/10" },
                { label: "Open", value: counts.Open, color: "text-emerald-300", bg: "bg-white/10" },
                { label: "Submitted", value: counts.Submitted, color: "text-emerald-300", bg: "bg-white/10" },
                { label: "Created", value: personalQuizzes.length, color: "text-purple-300", bg: "bg-white/10" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl px-3 py-1.5 flex items-center gap-2`}>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                  <span className="text-emerald-100/70 text-xs">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCreateQuizRedirect}
          className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-emerald-950 bg-white hover:bg-emerald-50 transition-all cursor-pointer flex-shrink-0 self-start sm:self-center shadow-md"
        >
          <Sparkles size={15} className="text-emerald-600" /> Create New Quiz
        </button>
      </div>

     
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {summaryCards.map(({ icon: Icon, bg, iconColor, label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 leading-tight">{label}</p>
              <p className="text-xl font-extrabold text-gray-700 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

   
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-0 border-b border-gray-50 flex items-center gap-1 flex-wrap overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer relative whitespace-nowrap flex-shrink-0 ${
                  isActive ? "text-emerald-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {counts[tab]}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-emerald-600" />
                )}
              </button>
            );
          })}
        </div>

        
        <div className="p-4 sm:p-5 flex flex-col gap-3" role="tabpanel">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"
                aria-hidden="true"
              />
            ))
          ) : filteredQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
              {activeTab === "Created Quizzes" ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
                    <Sparkles size={24} className="text-violet-300" />
                  </div>
                  <p className="text-base font-bold text-gray-600">No quizzes created yet</p>
                  <p className="text-sm text-gray-400 mt-1">Use AI to generate quizzes from your documents</p>
                  <button
                    onClick={handleCreateQuizRedirect}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors"
                  >
                    <Plus size={15} /> Create Your First Quiz
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <BookOpen size={24} className="text-gray-300" />
                  </div>
                  <p className="text-base font-bold text-gray-600">No quizzes found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {activeTab === "All Quizzes"
                      ? "Your instructor hasn't posted any quizzes yet."
                      : `No ${activeTab.toLowerCase()} quizzes.`}
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                showClassroom={!classroomId && activeTab !== "Created Quizzes"}
                isPersonal={activeTab === "Created Quizzes"}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default StudentQuizzesPage;