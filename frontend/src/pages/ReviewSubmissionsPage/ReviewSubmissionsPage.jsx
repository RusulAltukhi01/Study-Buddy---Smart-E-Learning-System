import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Search,
  Download,
  FileText,
  Sparkles,
  CheckCircle,
  Circle,
  Loader2,
  Layers,
  Rocket,
  BookOpen,
  Plus,
} from "lucide-react";
import assignmentService from "../../services/assignmentService";
import classroomService from "../../services/classroomService";
import { toast } from "sonner";

const getInitials = (firstName = "", lastName = "") =>
  `${(firstName[0] ?? "").toUpperCase()}${(lastName[0] ?? "").toUpperCase()}`;

const AVATAR_COLORS = [
  { bg: "#E8F0FE", text: "#3B5BDB" },
  { bg: "#E6FCF5", text: "#0CA678" },
  { bg: "#FFF3BF", text: "#E67700" },
  { bg: "#FFE8CC", text: "#D9480F" },
  { bg: "#F3D9FA", text: "#9C36B5" },
  { bg: "#D3F9D8", text: "#2F9E44" },
];

const avatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr);
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

const STATUS_CFG = {
  graded: { label: "GRADED", bg: "#DCFCE7", text: "#16A34A" },
  pending: { label: "PENDING", bg: "#DBEAFE", text: "#2563EB" },
  draft: { label: "DRAFT", bg: "#F3F4F6", text: "#6B7280" },
  late: { label: "LATE", bg: "#FEE2E2", text: "#DC2626" },
  missing: { label: "MISSING", bg: "#F3F4F6", text: "#9CA3AF" },
};

const DEFAULT_RUBRIC = [
  { label: "Historical Context", pts: 10, done: true },
  { label: "Mathematical Foundation", pts: 30, done: true },
  { label: "Practical Implementation", pts: 40, done: null },
  { label: "Conclusion & Future Outlook", pts: 20, done: false },
];

const AI_FEEDBACK =
  "Strong understanding of the core concepts. Analysis is precise and well-structured. However, the explanation of edge cases could benefit from more detailed examples and practical demonstrations.";
const AI_TAGS = ["HIGH ACCURACY", "STRUCTURAL CLARITY"];

const Avatar = ({ firstName, lastName, size = 36 }) => {
  const { bg, text } = avatarColor(`${firstName}${lastName}`);
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        color: text,
        fontSize: size * 0.35,
      }}
    >
      {getInitials(firstName, lastName)}
    </span>
  );
};

const StatCard = ({ label, main, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex flex-col gap-1 shadow-sm flex-1 min-w-0">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <span className="text-[2rem] font-extrabold leading-none text-gray-700">
        {main}
      </span>
      {sub && <span className="text-sm text-gray-400 font-medium">{sub}</span>}
    </div>
  </div>
);

const StudentRow = ({ student, assignment, isSelected, onClick }) => {
  const submission = student._submission;

  console.log("StudentRow - Full submission:", submission);
  console.log("StudentRow - Score value:", submission?.score);

  const statusKey = submission
    ? submission.status === "graded"
      ? "graded"
      : submission.status === "draft"
        ? "draft"
        : submission.isLate
          ? "late"
          : "pending"
    : "missing";

  const { label, bg, text } = STATUS_CFG[statusKey];

  let gradeDisplay = "—";
  if (submission?.score !== null && submission?.score !== undefined) {
    const maxScore = assignment?.points ?? 100;
    gradeDisplay = `${submission.score}/${maxScore}`;
  }

  return (
    <tr
      onClick={onClick}
      className={`border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? "bg-teal-50/60" : "hover:bg-gray-50"
      }`}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar firstName={student.firstName} lastName={student.lastName} />
          <span className="font-semibold text-gray-700 text-[14px]">
            {student.firstName} {student.lastName}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-[13px] text-gray-400">
        {submission?.submittedAt ? formatDateTime(submission.submittedAt) : "—"}
      </td>
      <td className="px-4 py-4">
        <span
          className="text-[11px] font-bold px-3 py-1 rounded-full tracking-wide"
          style={{ background: bg, color: text }}
        >
          {label}
        </span>
      </td>
      <td className="px-4 py-4 text-[14px] font-bold text-gray-700">
        {gradeDisplay}
      </td>
    </tr>
  );
};

const RubricChecklist = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Rubric Checklist
      </p>
      <button className="text-[12px] font-semibold text-teal-600 hover:underline">
        View Rubric
      </button>
    </div>
    <div className="flex flex-col gap-3">
      {DEFAULT_RUBRIC.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          {item.done === true ? (
            <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
          ) : item.done === null ? (
            <div className="w-[18px] h-[18px] rounded-full border-2 border-teal-400 flex-shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-teal-400" />
            </div>
          ) : (
            <Circle size={18} className="text-gray-300 flex-shrink-0" />
          )}
          <span
            className={`text-[13px] font-medium flex-1 ${
              item.done === null
                ? "text-teal-600"
                : item.done
                  ? "text-gray-700"
                  : "text-gray-400"
            }`}
          >
            {item.label}{" "}
            <span className="text-gray-400 font-normal">({item.pts}pts)</span>
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ReviewPanel = ({ student, assignment, onGradePublished }) => {
  const submission = student?._submission ?? null;

  const [score, setScore] = useState(submission?.score ?? "");
  const [feedback, setFeedback] = useState(submission?.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setScore(submission?.score ?? "");
    setFeedback(submission?.feedback ?? "");
  }, [
    student?._id,
    submission?.score,
    submission?.feedback,
    submission?.status,
  ]);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-3 bg-white rounded-2xl border border-gray-100">
        <FileText size={40} />
        <p className="text-sm">Select a student to review</p>
      </div>
    );
  }

  const maxScore = assignment?.points ?? 100;

  const handleSave = async (publish = false) => {
    if (score === "" || score === null) {
      toast.error("Please enter a score before saving");
      return;
    }

    if (publish) setPublishing(true);
    else setSaving(true);

    try {
      const gradeData = {
        score: Number(score),
        feedback: feedback,
        status: publish ? "graded" : "draft",
      };

      await assignmentService.gradeSubmission(
        assignment._id,
        student._id,
        gradeData,
      );

      onGradePublished({
        studentId: student._id,
        score: Number(score),
        feedback,
        status: publish ? "graded" : "draft",
        maxScore,
      });

      toast.success(
        publish
          ? `Grade published for ${student.firstName} ${student.lastName}`
          : "Draft saved",
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.error ?? err?.message ?? "Failed to save grade",
      );
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const files = (() => {
    if (!submission) return [];
    if (Array.isArray(submission.files) && submission.files.length > 0) {
      return submission.files.map((f) => ({
        name: f.name || f.fileName || f.originalName || "submission_file",
        url: f.url || f.fileUrl || f.path,
        size: f.size ? `${Math.round(f.size / 1024)} KB` : null,
      }));
    }
    if (submission.fileUrl) {
      return [
        {
          name: submission.fileUrl.split("/").pop() || "submission_file",
          url: submission.fileUrl,
          size: null,
        },
      ];
    }
    return [];
  })();

  const openFile = (url) => {
    if (!url) return;
    const full = url.startsWith("/")
      ? `http://localhost:5000${url}`
      : url.startsWith("http")
        ? url
        : `http://localhost:5000/uploads/${url}`;
    window.open(full, "_blank");
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-0.5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              firstName={student.firstName}
              lastName={student.lastName}
              size={42}
            />
            <div>
              <p className="font-bold text-gray-800 text-[16px]">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-[12px] text-gray-400">
                {submission?.submittedAt
                  ? `Submitted ${timeAgo(submission.submittedAt)}`
                  : "Not submitted yet"}
              </p>
            </div>
          </div>

          {submission?.status && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide"
              style={{
                background: STATUS_CFG[submission.status]?.bg ?? "#F3F4F6",
                color: STATUS_CFG[submission.status]?.text ?? "#6B7280",
              }}
            >
              {STATUS_CFG[submission.status]?.label ??
                submission.status.toUpperCase()}
            </span>
          )}
        </div>

        {files.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-700 truncate">
                    {f.name}
                  </p>
                  {f.size && (
                    <p className="text-[11px] text-gray-400">
                      {f.size} · Document
                    </p>
                  )}
                </div>
                <button
                  onClick={() => openFile(f.url)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : submission ? (
          <p className="mt-4 text-center text-[12px] text-gray-400 border border-dashed border-gray-200 rounded-xl py-3">
            No files attached to this submission
          </p>
        ) : null}
      </div>

      

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Manual Score &amp; Feedback
        </p>
        <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
          <input
            type="number"
            min={0}
            max={maxScore}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="—"
            className="flex-1 px-4 py-3 text-[1.2rem] font-bold text-gray-800 outline-none bg-gray-50 border-r border-gray-200"
          />
          <span className="px-4 text-sm text-gray-400 font-semibold bg-gray-50 py-3 flex-shrink-0">
            / {maxScore}
          </span>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add private feedback for the student..."
          rows={4}
          className="w-full px-4 py-3 text-[13px] text-gray-700 placeholder-gray-300 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none focus:border-teal-400 focus:bg-white transition-colors"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={publishing || score === ""}
            className="cursor-pointer flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)" }}
          >
            {publishing && <Loader2 size={13} className="animate-spin" />}
            Publish Grade
          </button>
        </div>
      </div>

      <RubricChecklist />
    </div>
  );
};

export default function ReviewSubmissionsPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [assignment, setAssignment] = useState(
    location.state?.assignment ?? null,
  );
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const selectedStudent = useMemo(
    () => students.find((s) => s._id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  const counts = useMemo(() => {
    return {
      all: students.length,
      active: students.filter(
        (s) =>
          s._submission &&
          s._submission.status !== "graded" &&
          s._submission.status !== "draft",
      ).length,
      draft: students.filter((s) => s._submission?.status === "draft").length,
      completed: students.filter((s) => s._submission?.status === "graded")
        .length,
    };
  }, [students]);

  useEffect(() => {
    if (assignment) return;
    assignmentService
      .getAssignmentById(assignmentId)
      .then((res) => setAssignment(res.data ?? res))
      .catch(console.error);
  }, [assignmentId, assignment]);

  console.log("assignm: ", assignment);

  useEffect(() => {
    if (!assignment?.classroom) return;
    const classroomId = assignment.classroom?._id ?? assignment.classroom;

    classroomService
      .getClassroomStudents(classroomId)
      .then((res) => {
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data?.students)) list = res.data.students;
        else if (Array.isArray(res.students)) list = res.students;
        else if (Array.isArray(res)) list = res;

        const submissions = assignment.submissions ?? [];

        const enriched = list.map((student) => {
          const sub =
            submissions.find(
              (s) =>
                s.student?.toString() === student._id?.toString() ||
                s.studentId?.toString() === student._id?.toString(),
            ) ??
            student.submissions?.find?.(
              (s) => s.assignment?.toString() === assignmentId,
            ) ??
            null;
          return { ...student, _submission: sub };
        });

        setStudents(enriched);

        const first = enriched.find((s) => s._submission) ?? enriched[0];
        if (first) setSelectedStudentId(first._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assignment, assignmentId]);

  const handleGradePublished = ({
    studentId,
    score,
    feedback,
    status,
    maxScore,
  }) => {
    console.log("Updating grade for student:", studentId, {
      score,
      feedback,
      status,
    });

    setStudents((prev) =>
      prev.map((s) => {
        if (s._id === studentId) {
          const updatedSubmission = {
            ...(s._submission || {}),
            score: score,
            feedback: feedback,
            status: status,
            maxScore: maxScore,
            submittedAt: s._submission?.submittedAt || new Date(),
            files: s._submission?.files || [],
          };

          console.log("Updated submission:", updatedSubmission);

          return {
            ...s,
            _submission: updatedSubmission,
          };
        }
        return s;
      }),
    );

    if (selectedStudentId === studentId) {
      setSelectedStudentId(selectedStudentId);
    }
  };

  const totalEnrolled = students.length;
  const submitted = students.filter((s) => s._submission).length;
  const graded = students.filter(
    (s) => s._submission?.status === "graded",
  ).length;
  const gradedPct =
    totalEnrolled > 0 ? Math.round((graded / totalEnrolled) * 100) : 0;
  const avgScore = (() => {
    const scored = students.filter((s) => s._submission?.score != null);
    if (!scored.length) return null;
    return (
      scored.reduce((a, s) => a + s._submission.score, 0) / scored.length
    ).toFixed(1);
  })();

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  const classroomName = assignment?.classroom?.name ?? "Classroom";
  const assignmentTitle = assignment?.title ?? "Assignment";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 ">
        <nav className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ">
          <button
            onClick={() => navigate("/instructor/classrooms")}
            className="text-gray-400 hover:text-gray-600 transition-color cursor-pointer"
          >
            Classrooms
          </button>
          <ChevronRight size={12} className="text-gray-300 cursor-pointer" />
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            {classroomName}
          </button>
          <ChevronRight size={12} className="text-gray-300 cursor-pointer" />
          <span className="text-teal-600">{assignmentTitle}</span>
        </nav>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or submission..."
            className="pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-teal-400 focus:bg-white transition-all w-64"
          />
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
      
        <div
          className="rounded-2xl p-5 sm:p-6 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)",
          }}
        >
          {/* glow blobs */}
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
              {classroomName}
            </span>
            <h1 className="text-white text-2xl font-extrabold italic leading-tight">
              {assignmentTitle}
            </h1>
            <p className="text-gray-400 text-[13px]">
              Review student submissions, manage scores, and publish feedback in
              real-time.
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
                    label: "Pending Review",
                    value: counts.active,
                    color: "text-cyan-400",
                    bg: "bg-cyan-400/10",
                  },
                  {
                    icon: BookOpen,
                    label: "Drafts",
                    value: counts.draft,
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                  },
                  {
                    icon: CheckCircle,
                    label: "Graded",
                    value: counts.completed,
                    color: "text-emerald-400",
                    bg: "bg-emerald-400/10",
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
                    <span className="text-gray-400 text-xs">{label}</span>
                  </div>
                ))}

               
                <div className="bg-white/5 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-200">
                    {avgScore != null ? `${avgScore}%` : "—"}
                  </span>
                  <span className="text-gray-400 text-xs">Class Average</span>
                </div>
              </div>
            )}
          </div>

         
          <button
            onClick={() => navigate(-1)}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 cursor-pointer flex-shrink-0 self-start sm:self-center"
            style={{ background: "#5bc0be" }}
          >
            Back to Classroom
          </button>
        </div>

        <div className="flex gap-5 flex-1 min-h-0">
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-300">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-sm">Loading submissions…</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Student Name", "Date", "Status", "Grade"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-12 text-center text-gray-400 text-sm"
                      >
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((student) => (
                      <StudentRow
                        key={student._id}
                        student={student}
                        assignment={assignment}
                        isSelected={selectedStudentId === student._id}
                        onClick={() => setSelectedStudentId(student._id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="w-[380px] flex-shrink-0">
            <ReviewPanel
              student={selectedStudent}
              assignment={assignment}
              onGradePublished={handleGradePublished}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
