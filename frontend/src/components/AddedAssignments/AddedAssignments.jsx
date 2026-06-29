import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  ChevronRight,
  FileEdit,
  BarChart2,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import CreateNewAssignment from "../../../forms/CreateNewAssignment/CreateNewAssignment";
import { useNavigate } from "react-router-dom";
import assignmentService from "../../services/assignmentService";
import { Loader } from "./../../UI/Loader/Loader";


function LinearProgressbar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg,#5bc0be,#10B981)",
        }}
      />
    </div>
  );
}


function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer flex-shrink-0"
      style={{
        width: 44,
        height: 24,
        background: checked ? "#5bc0be" : "#D1D5DB",
      }}
    >
      <span
        className="inline-block bg-white rounded-full shadow transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}


function SectionLabel({ color, label, count }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      {count !== undefined && (
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: color }}
        >
          {count}
        </span>
      )}
    </div>
  );
}


export function AssignmentCard({
  title,
  deadline,
  submitted,
  total,
  autoCorrect: initialCorrection = false,
  onEdit,
}) {
  const [autoCorrect, setAutoCorrect] = useState(initialCorrection);
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const isOverdue =
    deadline !== "No deadline" && new Date(deadline) < new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 overflow-hidden">
     
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg,#5bc0be,#10B981)" }}
      />

      <div className="px-5 pb-5 flex flex-col gap-4">
       
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-bold text-gray-800 text-[14px] leading-snug flex-1">
            {title}
          </h3>
          <button
            onClick={onEdit}
            className="text-gray-300 hover:text-gray-600 flex-shrink-0 mt-0.5 cursor-pointer transition-colors"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>

      
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold ${isOverdue ? "text-rose-500" : "text-gray-400"}`}
        >
          {isOverdue ? <AlertCircle size={13} /> : <Calendar size={13} />}
          <span>
            {isOverdue ? "Overdue: " : "Due: "}
            {deadline}
          </span>
        </div>

       
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users size={12} />
              <span>
                <span className="font-bold text-gray-700">{submitted}</span>/
                {total} submitted
              </span>
            </div>
            <span className="text-xs font-bold" style={{ color: "#5bc0be" }}>
              {pct}%
            </span>
          </div>
          <LinearProgressbar value={submitted} max={total} />
        </div>

       
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
            style={{ color: "#5bc0be" }}
          >
            <Sparkles size={12} />
            <span>Auto Correct</span>
          </div>
          <Toggle
            checked={autoCorrect}
            onChange={() => setAutoCorrect((p) => !p)}
          />
        </div>
      </div>
    </div>
  );
}


function DraftCard({ title, dueDate, onEdit }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-4 flex items-center justify-between gap-3 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileEdit size={14} className="text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-600 truncate">
            {title}
          </p>
          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock size={10} />
            {dueDate
              ? `Due ${new Date(dueDate).toLocaleDateString()}`
              : "No due date"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 rounded-lg px-2 py-1">
          Draft
        </span>
        <button
          onClick={onEdit}
          className="text-gray-300 hover:text-gray-600 cursor-pointer transition-colors"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}


function GradedCard({ title, graded, total, avg, onNavigate }) {
  const avgNum = Number(avg) || 0;
  const scoreColor =
    avgNum >= 75 ? "#10B981" : avgNum >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-800 text-[14px] leading-snug flex-1">
          {title}
        </h3>
        <CheckCircle2
          size={20}
          className="text-emerald-500 flex-shrink-0 mt-0.5"
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400 font-medium">
          {graded}/{total} graded
        </span>
        <span
          className="font-extrabold text-lg leading-none"
          style={{ color: scoreColor }}
        >
          {avg}%
        </span>
      </div>
      <LinearProgressbar value={graded} max={total} />
      <button
        onClick={onNavigate}
        className="w-full py-2 rounded-xl border border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        View Report
      </button>
    </div>
  );
}


function GradeDistribution({ data }) {
  const hasData = data.some((d) => d.value > 0);
  const maxVal = hasData ? Math.max(...data.map((d) => d.value)) : 1;
  const grades = ["F", "D", "C", "B", "A"];
  const colors = ["#fca5a5", "#fdba74", "#fcd34d", "#86efac", "#5bc0be"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-[15px]">
            Grade Distribution
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Based on graded assignments
          </p>
        </div>
        <BarChart2 size={18} className="text-gray-300" />
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-44 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
            <BarChart2 size={22} className="text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm font-medium">No grade data yet</p>
          <p className="text-gray-300 text-xs">
            Grades appear once assignments are graded
          </p>
        </div>
      ) : (
        <div className="flex items-end justify-around gap-3 h-44">
          {data.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-xs font-bold text-gray-500">
                {d.value > 0 ? d.value : ""}
              </span>
              <div
                className="w-full rounded-t-xl transition-all duration-500"
                style={{
                  height: `${(d.value / maxVal) * 120}px`,
                  background: colors[i],
                  minHeight: d.value > 0 ? 6 : 0,
                }}
              />
              <span className="text-xs font-bold text-gray-400">
                {grades[i]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function EmptyState({ label, onAdd }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
        <FileEdit size={22} className="text-gray-300" />
      </div>
      <p className="text-gray-500 font-semibold text-sm">{label}</p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "#5bc0be" }}
        >
          <Plus size={13} /> Create one
        </button>
      )}
    </div>
  );
}



export default function AddedAssignments({ classroomId }) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await assignmentService.getAssignments({ classroomId });
        setAssignments((res.data || []).filter(Boolean));
      } catch (err) {
        console.error("Failed to load assignments", err);
      } finally {
        setLoading(false);
      }
    };
    if (classroomId) load();
  }, [classroomId]);

  const handleCreated = (newAssignment) => {
    if (!newAssignment?._id) return; 

    const wasEditing = editingAssignment;
    setShowModal(false);
    setEditingAssignment(null);

    setAssignments((prev) =>
      wasEditing
        ? prev.map((a) => (a._id === newAssignment._id ? newAssignment : a))
        : [newAssignment, ...prev],
    );
  };

  const openEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowModal(true);
  };

  const active = assignments.filter(
    (a) => a && !a.isDraft && a.status !== "graded",
  );
  const drafts = assignments.filter((a) => a && a.isDraft);
  const graded = assignments.filter((a) => a && a.status === "graded");

  const gradeData = [
    { value: graded.filter((a) => a.averageScore < 50).length },
    {
      value: graded.filter((a) => a.averageScore >= 50 && a.averageScore < 60)
        .length,
    },
    {
      value: graded.filter((a) => a.averageScore >= 60 && a.averageScore < 75)
        .length,
    },
    {
      value: graded.filter((a) => a.averageScore >= 75 && a.averageScore < 90)
        .length,
    },
    { value: graded.filter((a) => a.averageScore >= 90).length },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );

  return (
    <>
      <CreateNewAssignment
        open={showModal}
        classroomId={classroomId}
        onClose={() => {
          setShowModal(false);
          setEditingAssignment(null);
        }}
        editingAssignment={editingAssignment}
        onSuccess={handleCreated}
      />

    
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pt-2">
        <div>
          <h2 className="text-[2em] font-bold text-(--dark-navy)">
            Assignments
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {assignments.length} total · {active.length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingAssignment(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: "#5bc0be" }}
          >
            <Plus size={15} /> Create Assignment
          </button>
          <button
            onClick={() =>
              navigate(`/instructor/classrooms/${classroomId}/assignments`)
            }
            className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-gray-700 cursor-pointer transition-colors px-3 py-2.5"
          >
            Show All <ChevronRight size={15} />
          </button>
        </div>
      </div>

      
      <div className="flex flex-col gap-8">
      
        <div>
          <SectionLabel
            color="#10B981"
            label="Active Assignments"
            count={active.length}
          />
          {active.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {active.map((a) => (
                <AssignmentCard
                  key={a._id}
                  title={a.title}
                  deadline={
                    a.dueDate
                      ? new Date(a.dueDate).toLocaleDateString()
                      : "No deadline"
                  }
                  submitted={a.submissions?.length ?? 0}
                  total={a.totalStudents ?? 0}
                  autoCorrect={a.autoCorrect}
                  onEdit={() => openEdit(a)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              label="No active assignments yet"
              onAdd={() => setShowModal(true)}
            />
          )}
        </div>

     
        {drafts.length > 0 && (
          <div>
            <SectionLabel
              color="#9CA3AF"
              label="Drafts"
              count={drafts.length}
            />
            <div className="flex flex-col gap-2.5 max-w-2xl">
              {drafts.map((a) => (
                <DraftCard
                  key={a._id}
                  title={a.title}
                  dueDate={a.dueDate}
                  onEdit={() => openEdit(a)}
                />
              ))}
            </div>
          </div>
        )}

      
        <div>
          <SectionLabel color="#5bc0be" label="Graded" count={graded.length} />
          {graded.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {graded.map((a) => (
                <GradedCard
                  key={a._id}
                  title={a.title}
                  graded={a.gradedCount ?? 0}
                  total={a.totalStudents ?? 0}
                  avg={a.averageScore ?? 0}
                  onNavigate={() =>
                    navigate(`/instructor/assignments/${a._id}/submissions`)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState label="No graded assignments yet" />
          )}
        </div>

        
        <GradeDistribution data={gradeData} />
      </div>
    </>
  );
}
