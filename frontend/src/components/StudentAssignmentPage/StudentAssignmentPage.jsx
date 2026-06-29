import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  AlertCircle,
  BookOpen,
  Eye,
  Loader2,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Star,
  Clock,
  ClipboardList,
  Award,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import assignmentService from "../../services/assignmentService";
import { toast } from "sonner";
import "./StudentAssignmentPage.css";

function formatDate(dateStr) {
  if (!dateStr) return "No due date";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const SubmissionWorkspace = ({ assignment, onClose, onSubmitted }) => {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const ACCEPTED = [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => ACCEPTED.includes(f.type));
    if (valid.length !== incoming.length)
      toast.warning("Only PDF, ZIP, DOCX files accepted");
    setFiles((p) => [...p, ...valid]);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }
    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(assignment._id, files);
      toast.success("Assignment submitted successfully!");
      onSubmitted(assignment._id);
      onClose();
    } catch {
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-violet-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <Upload size={13} className="text-violet-600" />
          </div>
          <span className="text-sm font-bold text-gray-800">Submission Workspace</span>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
          {assignment._id?.slice(-8).toUpperCase()}
        </span>
      </div>

      <div className="p-5">
        <p className="text-[11px] font-bold tracking-widest uppercase text-violet-500 mb-3">
          Upload Files (PDF, ZIP, DOCX)
        </p>

        <div
          role="button"
          tabIndex={0}
          aria-label="Upload files by clicking or dragging"
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? "border-violet-400 bg-violet-50"
              : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
            <FileText size={22} className="text-violet-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Drag and drop files here</p>
          <p className="text-xs text-gray-400 mb-4">Maximum file size: 25MB</p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
          >
            Browse Files
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.zip,.docx,.doc"
            className="hidden"
            aria-hidden="true"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-100">
                <FileText size={14} className="text-violet-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700 truncate">{f.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(f.size)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-violet-100">
        <p className="text-xs text-gray-400">
          <span className="text-violet-400">ⓘ</span> You can resubmit until the deadline.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || files.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment, onSubmitted, showClassroom = false }) => {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = getDaysLeft(assignment.dueDate);
  const isSubmitted = assignment.submissionStatus === "submitted";
  const isGraded = assignment.grade !== null && assignment.grade !== undefined;
  const isDueSoon = daysLeft !== null && daysLeft <= 2 && !isSubmitted;
  const isOverdue = daysLeft !== null && daysLeft < 0 && !isSubmitted;

  const percentage =
    isGraded && assignment.points
      ? Math.round((assignment.grade / assignment.points) * 100)
      : 0;

  const accentColor = isGraded
    ? "border-l-emerald-400"
    : isSubmitted
    ? "border-l-teal-400"
    : isDueSoon
    ? "border-l-red-400"
    : "border-l-violet-300";

  return (
    <article
      className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${accentColor} shadow-sm hover:shadow-md transition-all overflow-hidden`}
      aria-label={`Assignment: ${assignment.title}`}
    >
      <div className="p-5 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {isDueSoon && !isSubmitted && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-red-500">
                DUE SOON
              </span>
            )}
            {isOverdue && !isSubmitted && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                OVERDUE
              </span>
            )}
            {isSubmitted && !isGraded && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-600">
                SUBMITTED
              </span>
            )}
            {isGraded && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                GRADED
              </span>
            )}
            {assignment.points && (
              <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-violet-50 text-violet-600">
                {assignment.points} PTS
              </span>
            )}
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              aria-expanded={expanded}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors flex-shrink-0"
            >
              {expanded ? "Close" : "View & Submit"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <Eye size={13} /> View Submission
            </button>
          )}
        </header>

        {showClassroom && assignment.classroom?.name && (
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full w-fit mb-2 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
            {assignment.classroom.name}
          </p>
        )}

        <h2 className="text-base font-bold text-gray-800 mb-1 leading-snug">{assignment.title}</h2>

        {assignment.description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{assignment.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {isSubmitted
              ? `Submitted ${formatDate(assignment.submittedAt)}`
              : daysLeft === null
              ? "No due date"
              : daysLeft < 0
              ? `${Math.abs(daysLeft)}d overdue`
              : daysLeft === 0
              ? "Due Today"
              : `Due in ${daysLeft} days`}
          </span>
          <span className="flex items-center gap-1.5">
            <AlertCircle size={12} />
            {isGraded ? "Graded" : isSubmitted ? "Under Review" : "Pending"}
          </span>
        </div>

        {isGraded && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Your Score</span>
              <span className="text-lg font-black text-emerald-700">
                {assignment.grade}
                <span className="text-sm font-semibold text-emerald-500">/{assignment.points}</span>
                <span className="text-sm font-semibold text-emerald-600 ml-1">({percentage}%)</span>
              </span>
            </div>
            {assignment.feedback && (
              <p className="text-sm text-emerald-700 bg-white/60 rounded-lg px-3 py-2">{assignment.feedback}</p>
            )}
          </div>
        )}

        {isSubmitted && !isGraded && (
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-teal-600">
              <CheckCircle2 size={12} />
              Submitted {formatDate(assignment.submittedAt)}
            </p>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Star size={10} /> Awaiting Grade
            </span>
          </div>
        )}
      </div>

      {expanded && !isSubmitted && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <SubmissionWorkspace
            assignment={assignment}
            onClose={() => setExpanded(false)}
            onSubmitted={onSubmitted}
          />
        </div>
      )}

      {expanded && isSubmitted && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Your Submission</h4>
            {assignment.files && assignment.files.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Submitted Files</p>
                <ul className="flex flex-col gap-2">
                  {assignment.files.map((file, idx) => (
                    <li key={idx} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 text-sm">
                      <FileText size={13} className="text-violet-400" />
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline truncate">
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isGraded && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Grade Details</p>
                <div className="flex flex-col gap-1 text-sm text-gray-700">
                  <p><span className="font-semibold">Score:</span> {assignment.grade}/{assignment.points}</p>
                  <p><span className="font-semibold">Feedback:</span> {assignment.feedback || "No feedback provided"}</p>
                  <p><span className="font-semibold">Graded on:</span> {formatDate(assignment.gradedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

const TABS = ["All Assignments", "Pending", "Submitted", "Graded"];

const StudentAssignmentPage = () => {
  const { classroomId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Assignments");

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const params = classroomId ? { classroomId } : {};
        const res = await assignmentService.getStudentAssignments(params);
        setAssignments(res.data || []);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, [classroomId]);

  const handleSubmitted = (assignmentId) => {
    setAssignments((p) =>
      p.map((a) =>
        a._id === assignmentId
          ? { ...a, submissionStatus: "submitted", submittedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const filtered = assignments.filter((a) => {
    if (activeTab === "All Assignments") return true;
    if (activeTab === "Pending") return a.submissionStatus !== "submitted";
    if (activeTab === "Submitted") return a.submissionStatus === "submitted" && !a.grade;
    if (activeTab === "Graded") return a.grade !== null && a.grade !== undefined;
    return true;
  });

  const counts = {
    "All Assignments": assignments.length,
    Pending: assignments.filter((a) => a.submissionStatus !== "submitted").length,
    Submitted: assignments.filter((a) => a.submissionStatus === "submitted" && !a.grade).length,
    Graded: assignments.filter((a) => a.grade != null).length,
  };

  const pendingCount = counts["Pending"];
  const gradedCount = counts["Graded"];
  const submittedCount = counts["Submitted"];

  return (
    <main className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8" aria-label="Assignments">
      <div
        className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between overflow-hidden relative gap-4 mb-6"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)" }}
      >
        <div
          className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #34d399 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
            transform: "translateY(40%)",
          }}
        />

        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-300 bg-emerald-300/10 px-2 py-0.5 rounded-full w-fit">
            Coursework
          </span>
          <h1 className="text-white text-xl sm:text-2xl font-extrabold italic leading-tight">
            Assignments Lab
          </h1>
          <p className="text-emerald-200 text-[13px]">
            {pendingCount > 0 ? (
              <>
                You have{" "}
                <span className="text-white font-bold">{pendingCount} pending task{pendingCount !== 1 ? "s" : ""}</span>{" "}
                this week. Let's keep the momentum going.
              </>
            ) : (
              "You're all caught up! Great work."
            )}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 relative z-10 shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-emerald-300 text-[12px]">
            <CalendarDays size={13} />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
            <Sparkles size={13} className="text-emerald-300" />
            <span className="text-white text-[12px] font-semibold">{assignments.length} total assignment{assignments.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: ClipboardList, bg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Total", value: assignments.length },
          { icon: Clock, bg: "bg-amber-50", iconColor: "text-amber-500", label: "Pending", value: pendingCount },
          { icon: CheckCircle2, bg: "bg-teal-50", iconColor: "text-teal-500", label: "Submitted", value: submittedCount },
          { icon: Award, bg: "bg-emerald-50", iconColor: "text-emerald-500", label: "Graded", value: gradedCount },
        ].map(({ icon: Icon, bg, iconColor, label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
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
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer relative whitespace-nowrap flex-shrink-0"
                style={{ color: isActive ? "#10b981" : "#9CA3AF" }}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={isActive
                      ? { background: "#047857", color: "white" }
                      : { background: "#f3f4f6", color: "#9CA3AF" }}
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                <BookOpen size={24} className="text-emerald-400" />
              </div>
              <p className="text-base font-bold text-gray-600">No assignments found</p>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === "All Assignments"
                  ? "Your instructor hasn't posted any assignments yet."
                  : `No ${activeTab.toLowerCase()} assignments.`}
              </p>
            </div>
          ) : (
            filtered.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                onSubmitted={handleSubmitted}
                showClassroom={!classroomId}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default StudentAssignmentPage;