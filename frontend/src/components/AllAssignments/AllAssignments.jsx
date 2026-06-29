import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Eye,
  FileText,
  Upload,
  Link,
  Type,
  Video,
  Layers,
  CheckCircle,
  BookOpen,
  Rocket,
  X,
  Award,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Download,
  FileCode,
  Image,
  File,
} from "lucide-react";
import assignmentService from "../../services/assignmentService";
import CreateNewAssignment from "../../../forms/CreateNewAssignment/CreateNewAssignment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./AllAssignments.css";

const LIMIT = 10;

function deriveStatus(assignment) {
  if (assignment.isDraft) return "Draft";
  if (assignment.dueDate && new Date(assignment.dueDate) < new Date())
    return "Completed";
  return "Active";
}

function formatDate(dateStr) {
  if (!dateStr) return "NO DUE DATE";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRelative(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = due.getTime() - now.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}D OVERDUE`;
  if (days === 0) return "DUE TODAY";
  if (days === 1) return "DUE TOMORROW";
  if (days <= 7) return `DUE IN ${days}D`;
  return `DUE ${formatDate(dateStr).toUpperCase()}`;
}

const SUBMISSION_TYPE_ICONS = {
  file: Upload,
  text: Type,
  link: Link,
  video: Video,
};

const STATUS_CONFIG = {
  Active: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "#10B981" },
  Draft: { bg: "bg-amber-100", text: "text-amber-700", dot: "#F59E0B" },
  Completed: { bg: "bg-gray-100", text: "text-gray-500", dot: "#9CA3AF" },
};


function getFileIcon(file) {
  const name = (file.name || file.filename || "").toLowerCase();
  const type = (file.type || file.mimeType || "").toLowerCase();
  if (type.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(name))
    return "image";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  return "file";
}

function FilePreview({ file }) {
  const kind = getFileIcon(file);
  const name = file.name || file.filename || "Untitled File";
  const ext = name.split(".").pop()?.toUpperCase() || "FILE";

  if (kind === "image" && file.url) {
    return (
      <div
        className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
        style={{ height: 90 }}
      >
        <img
          src={file.url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-white/90 rounded-lg text-gray-700 hover:bg-white transition-colors"
          >
            <ExternalLink size={13} />
          </a>
          <a
            href={file.downloadUrl || file.url}
            download
            className="p-1.5 bg-white/90 rounded-lg text-gray-700 hover:bg-white transition-colors"
          >
            <Download size={13} />
          </a>
        </div>
        <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-[10px] font-semibold text-white truncate">
            {name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl group hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
          {kind === "pdf" ? (
            <FileText size={15} className="text-teal-600" />
          ) : (
            <FileCode size={15} className="text-teal-600" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase">
            {file.size ? `${file.size} · ` : ""}
            {ext}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {file.url && (
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            title="Open"
          >
            <ExternalLink size={13} />
          </a>
        )}
        <a
          href={file.downloadUrl || file.url}
          download
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          title="Download"
        >
          <Download size={13} />
        </a>
      </div>
    </div>
  );
}


function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex flex-col gap-4"
      style={{ width: 340, height: 420 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-100 rounded-full flex-shrink-0" />
      </div>
      <div className="h-16 bg-gray-100 rounded-xl" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="h-full bg-gray-100 rounded-xl" />
        <div className="h-full bg-gray-100 rounded-xl" />
      </div>
      <div className="h-9 bg-gray-100 rounded-xl" />
    </div>
  );
}


function EmptyState({ onCreateClick, search }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 bg-white rounded-2xl border border-gray-100">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)",
        }}
      >
        <FileText size={32} className="text-white/30" />
      </div>
      <div className="text-center px-4">
        <p className="text-gray-700 font-bold text-base">
          {search ? "No assignments match your search" : "No assignments yet"}
        </p>
        <p className="text-gray-400 text-sm mt-1 max-w-xs">
          {search
            ? "Try a different search term or clear the filter."
            : "Create your first assignment to get started."}
        </p>
      </div>
      {!search && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 cursor-pointer"
          style={{ background: "#5bc0be" }}
        >
          <Plus size={15} /> Create First Assignment
        </button>
      )}
    </div>
  );
}


export function AssignmentCard({
  assignment,
  index,
  highlighted,
  onDelete,
  onEdit,
}) {
  const [deleting, setDeleting] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  const status = deriveStatus(assignment);
  const { bg, text, dot } = STATUS_CONFIG[status] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "#9ca3af",
  };


  const submittedCount =
    assignment.submittedCount ?? assignment.submissions?.length ?? 0;
  const totalStudents = assignment.totalStudents ?? 0;
  const filesList = (assignment.attachedFiles || []).filter(Boolean);

  const progressPct =
    totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  const SubmissionIcon =
    SUBMISSION_TYPE_ICONS[assignment.submissionType] || FileText;
  const relativeDate = formatDateRelative(assignment.dueDate);
  const isOverdue =
    assignment.dueDate &&
    new Date(assignment.dueDate) < new Date() &&
    !assignment.isDraft;

  const hasFiles = filesList.length > 0;
  const FILES_PREVIEW = 2; 

  const DESCRIPTION_LIMIT = 80;
  const desc = assignment.description || "";
  const descTruncated = desc.length > DESCRIPTION_LIMIT;

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${assignment.title}"?`)) return;
    setDeleting(true);
    try {
      await assignmentService.deleteAssignment(assignment._id);
      onDelete(assignment._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div
      ref={cardRef}
     
      className={`rounded-2xl border bg-white flex flex-col   overflow-hidden transition-all duration-300 ${
        highlighted
          ? "border-teal-500 shadow-xl shadow-teal-500/10"
          : "border-gray-100 shadow-sm shadow-gray-200/50"
      }`}
      style={{  minHeight: 500 }}
    >
     
      <div
        className="h-1.5 w-full flex-shrink-0"
        style={{
          background:
            status === "Active"
              ? "linear-gradient(90deg,#14b8a6,#0d9488)"
              : status === "Draft"
                ? "linear-gradient(90deg,#f59e0b,#d97706)"
                : "linear-gradient(90deg,#9ca3af,#4b5563)",
        }}
      />

      <div className="p-5 flex flex-col flex-1 gap-3 h-full">
      
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex-shrink-0 flex items-center justify-center text-sm font-bold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-gray-800 text-[14px] leading-snug tracking-tight line-clamp-2">
                {assignment.title}
              </h2>
              {assignment.classroom?.name && (
                <p className="text-xs font-medium text-gray-400 mt-0.5 truncate">
                  {assignment.classroom.name}
                </p>
              )}
            </div>
          </div>
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${bg} ${text}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: dot }}
            />
            {status}
          </span>
        </div>

        
        {desc && (
          <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100 flex flex-col gap-1 ">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Description
            </span>
            <p
              className="text-sm text-gray-600 leading-relaxed whitespace-pre-line"
              style={
                !descExpanded
                  ? {
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
                  : {}
              }
            >
              {desc}
            </p>
            {descTruncated && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="self-start flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors mt-0.5"
              >
                {descExpanded ? (
                  <>
                    <ChevronUp size={13} /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} /> Show more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
            <SubmissionIcon size={13} className="text-gray-500" />
            {assignment.submissionType || "file"}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-50 text-amber-700 text-xs font-semibold border border-amber-100">
            <Award size={13} /> {assignment.points ?? 0} pts
          </span>
        </div>

        
        {hasFiles && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Attached Materials ({filesList.length})
            </span>

            
            {(() => {
              const images = filesList.filter(
                (f) => getFileIcon(f) === "image",
              );
              const others = filesList.filter(
                (f) => getFileIcon(f) !== "image",
              );
              const visibleImages = filesExpanded
                ? images
                : images.slice(0, FILES_PREVIEW);
              const visibleOthers = filesExpanded
                ? others
                : others.slice(
                    0,
                    Math.max(0, FILES_PREVIEW - visibleImages.length),
                  );
              const hiddenCount =
                filesList.length - visibleImages.length - visibleOthers.length;

              return (
                <>
                  {visibleImages.length > 0 && (
                    <div
                      className={`grid gap-2 ${visibleImages.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                    >
                      {visibleImages.map((f, i) => (
                        <FilePreview key={i} file={f} />
                      ))}
                    </div>
                  )}
                  {visibleOthers.map((f, i) => (
                    <FilePreview key={i} file={f} />
                  ))}
                  {(hiddenCount > 0 || filesExpanded) && (
                    <button
                      onClick={() => setFilesExpanded(!filesExpanded)}
                      className="self-start flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      {filesExpanded ? (
                        <>
                          <ChevronUp size={13} /> Show fewer files
                        </>
                      ) : (
                        <>
                          <ChevronDown size={13} /> +{hiddenCount} more file
                          {hiddenCount !== 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}

        
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="flex flex-col gap-1 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Submissions
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-gray-800">
                {submittedCount}
              </span>
              <span className="text-xs text-gray-400">/ {totalStudents}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 p-3 border border-gray-100 rounded-xl bg-gray-50/50 justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Due Date
              </span>
              <p
                className={`text-xs font-bold mt-1 ${isOverdue ? "text-red-500" : "text-gray-700"}`}
              >
                {assignment.dueDate
                  ? formatDate(assignment.dueDate)
                  : "No due date"}
              </p>
            </div>
            {relativeDate && (
              <p
                className={`text-[10px] font-semibold tracking-wide ${isOverdue ? "text-red-400" : "text-teal-600"}`}
              >
                {relativeDate}
              </p>
            )}
          </div>
        </div>

       
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <button
            onClick={() => onEdit(assignment)}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer disabled:opacity-40"
            title="Delete"
          >
            <Trash2 size={15} className={deleting ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() =>
              navigate(
                `/instructor/assignments/${assignment._id}/submissions`,
                { state: { assignment } },
              )
            }
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm shadow-teal-700/10 hover:opacity-95 transition-opacity cursor-pointer bg-gradient-to-br from-teal-500 to-teal-600"
          >
            <Eye size={14} /> Review submissions
          </button>
        </div>
      </div>
    </div>
  );
}


export default function AllAssignments() {
  const { classroomId: paramClassroomId } = useParams();
  const location = useLocation();
  const classroomId = paramClassroomId ?? location.state?.classroomId ?? null;

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    draft: 0,
    completed: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [highlightId, setHighlightId] = useState(
    location.state?.highlightId || null,
  );

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(t);
  }, [highlightId]);

  const fetchAll = useCallback(async () => {
    try {
      const res = await assignmentService.getAssignments({ classroomId });
      const all = (res.data ?? []).filter(Boolean);
      const now = new Date();
      setCounts({
        all: all.length,
        active: all.filter(
          (a) => !a.isDraft && (!a.dueDate || new Date(a.dueDate) >= now),
        ).length,
        draft: all.filter((a) => a.isDraft).length,
        completed: all.filter(
          (a) => !a.isDraft && a.dueDate && new Date(a.dueDate) < now,
        ).length,
      });
    } catch (err) {
      console.log(err);
    }
  }, [classroomId]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: LIMIT };
      if (classroomId) params.classroomId = classroomId;
      if (activeTab === "draft") params.isDraft = true;
      else if (activeTab === "active") params.isDraft = false;

      const res = await assignmentService.getAssignments(params);
      let data = (res.data ?? []).filter(Boolean);
      if (activeTab === "completed") {
        data = data.filter(
          (a) => !a.isDraft && a.dueDate && new Date(a.dueDate) < new Date(),
        );
      }
      setAssignments(data);
      setPagination(res.pagination ?? { total: data.length, pages: 1 });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, classroomId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const displayed = assignments.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (deletedId) => {
    setAssignments((prev) => prev.filter((a) => a._id !== deletedId));
    fetchAll();
  };

  const TABS = [
    { label: "All", count: counts.all, key: "all" },
    { label: "Active", count: counts.active, key: "active" },
    { label: "Draft", count: counts.draft, key: "draft" },
    { label: "Completed", count: counts.completed, key: "completed" },
  ];

  return (
    <>
      <CreateNewAssignment
        open={showModal || !!editAssignment}
        onClose={() => {
          setShowModal(false);
          setEditAssignment(null);
        }}
        classroomId={classroomId}
        editingAssignment={editAssignment}
        onSuccess={async () => {
          setShowModal(false);
          setEditAssignment(null);
          await fetchAll();
          await fetchAssignments();
        }}
      />

      <div
        className="w-full min-h-screen px-4 sm:px-6 py-6 sm:py-8"
        style={{ backgroundColor: "var(--primary-background,#f3f4f6)" }}
      >
        
        <div
          className="rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)",
          }}
        >
          <div
            className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#5bc0be 0%,transparent 70%)",
              transform: "translate(30%,-30%)",
            }}
          />
          <div
            className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#6c63ff 0%,transparent 70%)",
              transform: "translateY(50%)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full w-fit">
              Classroom Tasks
            </span>
            <h1 className="text-white text-2xl font-extrabold italic leading-tight">
              Assignments
            </h1>
            <p className="text-gray-400 text-[13px]">
              Create, manage, and review all student assignments in one place.
            </p>

            {!loading && counts.all > 0 && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {[
                  {
                    icon: Layers,
                    label: "Total",
                    value: counts.all,
                    color: "text-white",
                    bg: "bg-white/10",
                  },
                  {
                    icon: Rocket,
                    label: "Active",
                    value: counts.active,
                    color: "text-cyan-400",
                    bg: "bg-cyan-400/10",
                  },
                  {
                    icon: BookOpen,
                    label: "Draft",
                    value: counts.draft,
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                  },
                  {
                    icon: CheckCircle,
                    label: "Completed",
                    value: counts.completed,
                    color: "text-gray-400",
                    bg: "bg-white/5",
                  },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div
                    key={label}
                    className={`${bg} rounded-xl px-3 py-1.5 flex items-center gap-1.5`}
                  >
                    <Icon size={12} className={color} />
                    <span className={`text-sm font-bold ${color}`}>
                      {value}
                    </span>
                    <span className="text-gray-500 text-xs">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setEditAssignment(null);
              setShowModal(true);
            }}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 cursor-pointer flex-shrink-0 self-start sm:self-center"
            style={{ background: "#5bc0be" }}
          >
            <Plus size={16} /> Create New Assignment
          </button>
        </div>

       
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-[#0d9488]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                style={activeTab === tab.key ? { background: "#5bc0be22" } : {}}
              >
                {tab.label}
                <span
                  className={`ml-1 text-[11px] ${activeTab === tab.key ? "text-teal-600" : "text-gray-400"}`}
                >
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-64">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search assignments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        
        {loading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            search={search}
            onCreateClick={() => {
              setEditAssignment(null);
              setShowModal(true);
            }}
          />
        ) : (
          <div className="flex flex-wrap gap-4 items-start ">
            {displayed.map((assignment, i) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                index={i}
                highlighted={
                  assignment._id?.toString() === highlightId?.toString()
                }
                onDelete={handleDelete}
                onEdit={(a) => {
                  setEditAssignment(a);
                  setShowModal(false);
                }}
              />
            ))}
          </div>
        )}

       
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400 px-2">
              Page {currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.pages, p + 1))
              }
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
