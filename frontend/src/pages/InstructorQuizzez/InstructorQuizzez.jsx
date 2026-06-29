import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  MoreVertical,
  CheckCircle,
  FileText,
  Users,
  Star,
  BookOpen,
  LayoutGrid,
  Download,
  Edit,
  X,
} from "lucide-react";
import quizService from "../../services/quizService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CreateQuizForm from "../../../forms/CreateQuizForm/CreateQuizForm";
import { getCurrentQuizStatus } from "../../utils/quizStatus";


const TABS = [
  { key: "all",       label: "All Quizzes" },
  { key: "published", label: "Published"   },
  { key: "draft",     label: "Drafts"      },
  { key: "closed",    label: "Closed"      },
];

const STATUS_CONFIG = {
  opened:    { label: "Open",      dot: "#10b981", bg: "#ecfdf5", text: "#059669" },
  scheduled: { label: "Scheduled", dot: "#f59e0b", bg: "#fffbeb", text: "#d97706" },
  draft:     { label: "Draft",     dot: "#9ca3af", bg: "#f9fafb", text: "#6b7280" },
  closed:    { label: "Closed",    dot: "#ef4444", bg: "#fef2f2", text: "#dc2626" },
};

const ICON_PALETTES = [
  { bg: "#e0f2fe", color: "#0284c7", Icon: BookOpen    },
  { bg: "#ede9fe", color: "#7c3aed", Icon: LayoutGrid  },
  { bg: "#fef3c7", color: "#d97706", Icon: Star        },
  { bg: "#fce7f3", color: "#db2777", Icon: FileText    },
  { bg: "#dcfce7", color: "#16a34a", Icon: CheckCircle },
];

function getIconStyle(title = "") {
  return ICON_PALETTES[(title.charCodeAt(0) || 0) % ICON_PALETTES.length];
}


function MoreMenu({ quizId, status, onPublish, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all cursor-pointer"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 min-w-[140px]"
          onMouseLeave={() => setOpen(false)}
        >
          {status !== "published" && (
            <button
              onClick={() => { onPublish(quizId); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <CheckCircle size={13} className="text-emerald-500" /> Publish
            </button>
          )}
          <button
            onClick={() => { onDelete(quizId); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}


function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[260, 140, 80, 100, 90].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 flex-1 min-w-0">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-2xl font-extrabold text-gray-700 leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}


function EmptyState({ onCreateClick }) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="py-20 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}>
            <FileText size={26} className="text-white/30" />
          </div>
          <p className="text-gray-700 font-bold text-sm">No quizzes found</p>
          <p className="text-gray-400 text-xs max-w-xs">
            Create a quiz to start assessing your students' knowledge.
          </p>
          <button
            onClick={onCreateClick}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: "#5bc0be" }}
          >
            <Plus size={14} /> Create First Quiz
          </button>
        </div>
      </td>
    </tr>
  );
}


const InstructorQuizzez = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [avgScore, setAvgScore]     = useState(0);

  useEffect(() => { fetchQuizzes(); }, []);

  async function fetchQuizzes() {
    setLoading(true);
    try {
      const res = await quizService.getQuizzes();
      setQuizzes(res.data || []);
    } catch {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { calculateOverallAverage(); }, [quizzes]);

  async function calculateOverallAverage() {
    if (!quizzes.length) { setAvgScore(0); return; }
    let totalPercentage = 0;
    let quizzesWithSubmissions = 0;
    for (const quiz of quizzes) {
      if (quiz.avgScore) {
        totalPercentage += quiz.avgScore;
        quizzesWithSubmissions++;
      } else if (quiz.submissions?.length > 0) {
        const quizAvg = quiz.submissions.reduce((sum, sub) => sum + (sub.percentage || 0), 0) / quiz.submissions.length;
        totalPercentage += quizAvg;
        quizzesWithSubmissions++;
      } else if (quiz.submissionCount > 0) {
        try {
          const fullQuiz = await quizService.getQuizById(quiz._id);
          if (fullQuiz.data.submissions?.length > 0) {
            const quizAvg = fullQuiz.data.submissions.reduce((sum, sub) => sum + (sub.percentage || 0), 0) / fullQuiz.data.submissions.length;
            totalPercentage += quizAvg;
            quizzesWithSubmissions++;
          }
        } catch { console.error(`Failed to fetch quiz ${quiz._id}`); }
      }
    }
    setAvgScore(quizzesWithSubmissions > 0 ? Math.round(totalPercentage / quizzesWithSubmissions) : 0);
  }

  async function handlePublish(id) {
    try {
      await quizService.publishQuiz(id);
      setQuizzes((p) => p.map((q) => (q._id === id ? { ...q, status: "published" } : q)));
    } catch (err) { console.log(err.message); }
  }

  async function handleEdit(quiz) {
    try {
      const res = await quizService.getQuizById(quiz._id);
      setEditingQuiz(res.data);
      setShowCreate(true);
    } catch { toast.error("Failed to load quiz for editing"); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await quizService.deleteQuiz(id);
      setQuizzes((p) => p.filter((q) => q._id !== id));
    } catch { toast.error("Failed to delete quiz"); }
  }

  async function handleExportGrades(quiz) {
    try {
      const res = await quizService.getQuizById(quiz._id);
      const fullQuiz = res.data;
      const rows = [["Student Name", "Email", "Score", "Total Points", "Percentage", "Attempt", "Time Taken (sec)", "Submitted At"]];
      if (!fullQuiz.submissions?.length) { toast.info("No submissions yet for this quiz"); return; }
      fullQuiz.submissions.forEach((sub, index) => {
        rows.push([
          `${sub.student?.firstName || ""} ${sub.student?.lastName || ""}`.trim() || "Unknown",
          sub.student?.email || "—",
          sub.score ?? 0,
          sub.totalPoints ?? 0,
          `${sub.percentage ?? 0}%`,
          index + 1,
          sub.timeTaken ?? "—",
          sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "—",
        ]);
      });
      const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quiz.title.replace(/\s+/g, "_")}_grades.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Grades exported!");
    } catch { toast.error("Failed to export grades"); }
  }

  const displayed =
    activeTab === "all"    ? quizzes
    : activeTab === "closed" ? quizzes.filter((q) => getCurrentQuizStatus(q) === "closed")
    : quizzes.filter((q) => q.status === activeTab);

  const totalSubmissions = quizzes.reduce((acc, q) => acc + (q.submissionCount || 0), 0);

  const tabCount = (key) =>
    key === "all"    ? quizzes.length
    : key === "closed" ? quizzes.filter((q) => getCurrentQuizStatus(q) === "closed").length
    : quizzes.filter((q) => q.status === key).length;

  return (
    <>
      {showCreate && (
        <CreateQuizForm
          onClose={() => { setShowCreate(false); setEditingQuiz(null); }}
          onSuccess={(quiz) => {
            setQuizzes((p) => editingQuiz ? p.map((q) => (q._id === quiz._id ? quiz : q)) : [quiz, ...p]);
            setEditingQuiz(null);
          }}
          editingQuiz={editingQuiz}
        />
      )}

      <div
        className="w-full min-h-screen px-6 py-8"
        style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}
      >
       
        <div
          className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
        >
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#5bc0be 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#6c63ff 0%,transparent 70%)", transform: "translateY(50%)" }} />

          <div className="relative z-10 flex flex-col gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full w-fit">
              Assessments
            </span>
            <h1 className="text-white text-2xl font-extrabold italic leading-tight">
              Quiz Management
            </h1>
            <p className="text-gray-400 text-[13px]">
              Create, manage, and track quiz performance across all your classrooms.
            </p>

            {/* summary pills */}
            {!loading && quizzes.length > 0 && (
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {[
                  { label: "Total",       value: quizzes.length,                                                        color: "text-white",      bg: "bg-white/10"       },
                  { label: "Published",   value: quizzes.filter((q) => q.status === "published").length,                color: "text-cyan-400",   bg: "bg-cyan-400/10"    },
                  { label: "Drafts",      value: quizzes.filter((q) => q.status === "draft").length,                    color: "text-amber-400",  bg: "bg-amber-400/10"   },
                  { label: "Submissions", value: totalSubmissions,                                                       color: "text-purple-400", bg: "bg-purple-400/10"  },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl px-4 py-2 flex items-center gap-2`}>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                    <span className="text-gray-500 text-xs">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 cursor-pointer flex-shrink-0 self-start sm:self-center"
            style={{ background: "#5bc0be" }}
          >
            <Plus size={16} /> Create New Quiz
          </button>
        </div>

     
        <div className="flex gap-4 mb-6">
          <StatCard icon={CheckCircle} iconBg="#e0f2fe" iconColor="#0284c7" label="Total Quizzes"      value={quizzes.length} />
          <StatCard icon={Users}       iconBg="#ede9fe" iconColor="#7c3aed" label="Total Submissions"  value={totalSubmissions.toLocaleString()} />
          <StatCard icon={Star}        iconBg="#fef3c7" iconColor="#d97706" label="Avg. Score"         value={avgScore > 0 ? `${avgScore}%` : "—"} />
        </div>

       
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          
          <div className="px-5 pt-4 pb-0 border-b border-gray-50 flex items-center gap-1 flex-wrap">
            {TABS.map((tab) => {
              const count = tabCount(tab.key);
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer relative"
                  style={{ color: isActive ? "#0d1b2a" : "#9CA3AF" }}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                      style={isActive
                        ? { background: "#0d1b2a", color: "white" }
                        : { background: "#f3f4f6", color: "#9CA3AF" }}
                    >
                      {count}
                    </span>
                  )}
                 
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ background: "#5bc0be" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

       
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Quiz Title", "Classroom", "Submissions", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : displayed.length === 0
                  ? <EmptyState onCreateClick={() => setShowCreate(true)} />
                  : displayed.map((quiz) => {
                      const { bg, color, Icon } = getIconStyle(quiz.title);
                      const liveStatus = getCurrentQuizStatus(quiz);
                      const statusCfg  = STATUS_CONFIG[liveStatus] || STATUS_CONFIG.closed;

                      return (
                        <tr key={quiz._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">

                        
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: bg }}
                              >
                                <Icon size={16} style={{ color }} />
                              </div>
                              <span className="font-semibold text-gray-800 text-[13px] leading-snug">
                                {quiz.title}
                              </span>
                            </div>
                          </td>

                        
                          <td className="px-5 py-4">
                            <span className="text-[13px] text-gray-500">
                              {quiz.classroom?.name || quiz.course?.title || "—"}
                            </span>
                          </td>

                     
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <Users size={13} className="text-gray-400" />
                              <span className="text-[13px] font-semibold text-gray-700">
                                {quiz.submissionCount || 0}
                              </span>
                            </div>
                          </td>

                          
                          <td className="px-5 py-4">
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: statusCfg.bg, color: statusCfg.text }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: statusCfg.dot }}
                              />
                              {statusCfg.label}
                            </span>
                          </td>

                        
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(quiz)}
                                title="Edit quiz"
                                className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 transition-all cursor-pointer"
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#1a2e45"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleExportGrades(quiz)}
                                title="Export grades"
                                className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 transition-all cursor-pointer"
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#5bc0be"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
                              >
                                <Download size={14} />
                              </button>
                              <MoreMenu
                                quizId={quiz._id}
                                status={quiz.status}
                                onPublish={handlePublish}
                                onDelete={handleDelete}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorQuizzez;