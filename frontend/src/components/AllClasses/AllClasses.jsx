import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  BookOpen,
  ArrowRight,
  X,
  Loader2,
  GraduationCap,
  Archive,
  LayoutGrid,
  List,
} from "lucide-react";
import classroomService from "../../services/classroomService";
import CreateRoomForm from "../../../forms/CreateRoomForm/CreateRoomForm";
import Pagination from "../Pagination/Pagination";


const TAG_COLORS = [
  { bg: "bg-teal-400",    text: "text-white" },
  { bg: "bg-purple-400",  text: "text-white" },
  { bg: "bg-blue-400",    text: "text-white" },
  { bg: "bg-rose-400",    text: "text-white" },
  { bg: "bg-amber-400",   text: "text-white" },
  { bg: "bg-emerald-400", text: "text-white" },
];
function getTagColor(str = "", offset = 0) {
  return TAG_COLORS[((str.charCodeAt(0) || 0) + offset) % TAG_COLORS.length];
}


function CreateClassModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", batch: "", subject: "" });
  const [loading, setLoading] = useState(false);
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await classroomService.createClassroom({
        name: form.name.trim(),
        description: form.description.trim(),
        batch: form.batch.trim(),
        subject: form.subject.trim(),
      });
      onCreated(res.data);
      setForm({ name: "", description: "", batch: "", subject: "" });
      onClose();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,20,40,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Class</h2>
            <p className="text-sm text-gray-400 mt-1">Set up a workspace and invite students</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Class Name <span className="text-red-400">*</span></label>
            <input
              type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g., Web Development – Batch A"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={form.description} onChange={(e) => setField("description", e.target.value)}
              placeholder="Short description of what this class covers..." rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Subject / Track</label>
              <input
                type="text" value={form.subject} onChange={(e) => setField("subject", e.target.value)}
                placeholder="e.g., Frontend"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Batch</label>
              <input
                type="text" value={form.batch} onChange={(e) => setField("batch", e.target.value)}
                placeholder="e.g., Batch A"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
              />
            </div>
          </div>
        </div>
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={loading || !form.name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-default"
            style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {loading ? "Creating…" : "Create Class"}
          </button>
        </div>
      </div>
    </div>
  );
}


function ClassCard({ classroom, onViewDashboard }) {
  const tags = [classroom.subject, classroom.batch, classroom.track, classroom.category]
    .filter(Boolean).slice(0, 3);
  const activeAssignments = classroom.activeAssignments ?? classroom.assignmentCount ?? 0;
  const studentCount = classroom.studentCount ?? classroom.students?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group flex flex-col">
     
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        {classroom.coverImage ? (
          <img src={classroom.coverImage} alt={classroom.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full relative"
            style={{
              background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)",
            }}
          >
          
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(30deg,#5bc0be 12%,transparent 12.5%,transparent 87%,#5bc0be 87.5%,#5bc0be),
                  linear-gradient(150deg,#5bc0be 12%,transparent 12.5%,transparent 87%,#5bc0be 87.5%,#5bc0be),
                  linear-gradient(30deg,#5bc0be 12%,transparent 12.5%,transparent 87%,#5bc0be 87.5%,#5bc0be),
                  linear-gradient(150deg,#5bc0be 12%,transparent 12.5%,transparent 87%,#5bc0be 87.5%,#5bc0be),
                  linear-gradient(60deg,#5bc0be77 25%,transparent 25.5%,transparent 75%,#5bc0be77 75%,#5bc0be77),
                  linear-gradient(60deg,#5bc0be77 25%,transparent 25.5%,transparent 75%,#5bc0be77 75%,#5bc0be77)`,
                backgroundSize: "20px 35px",
                backgroundPosition: "0 0,0 0,10px 18px,10px 18px,0 0,10px 18px",
              }}
            />
       
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-black text-white/10 select-none">
                {classroom.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        )}
        {tags.length > 0 && (
          <div className="absolute bottom-2.5 left-3 flex gap-1.5 flex-wrap">
            {tags.map((tag, i) => {
              const { bg, text } = getTagColor(tag, i);
              return (
                <span key={tag} className={`${bg} ${text} text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide`}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}
        
        <div className="absolute top-2.5 right-2.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            classroom.status === "archived"
              ? "bg-gray-700/70 text-gray-300"
              : "bg-emerald-500/90 text-white"
          }`}>
            {classroom.status === "archived" ? "ARCHIVED" : "ACTIVE"}
          </span>
        </div>
      </div>

   
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-800 text-[15px] leading-snug line-clamp-2 tracking-tight">
            {classroom.name}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <GraduationCap size={11} />
            {classroom.instructor?.name || classroom.instructorName || "Instructor"}
          </p>
        </div>

      
        <div className="flex items-center gap-4 py-2 border-y border-gray-50">
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-gray-400" />
            <span className="text-[13px] font-bold text-gray-700">{studentCount}</span>
            <span className="text-[11px] text-gray-400">students</span>
          </div>
          <div className="w-px h-4 bg-gray-100" />
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} style={{ color: "#5bc0be" }} />
            <span className="text-[13px] font-bold" style={{ color: "#5bc0be" }}>{activeAssignments}</span>
            <span className="text-[11px] text-gray-400">active</span>
          </div>
        </div>

        {classroom.accessCode && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Code</span>
            <code className="text-[11px] font-mono font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
              {classroom.accessCode}
            </code>
          </div>
        )}

        <button
          onClick={() => onViewDashboard(classroom._id)}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
        >
          Open Classroom
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}


function ClassRow({ classroom, onViewDashboard }) {
  const tags = [classroom.subject, classroom.batch].filter(Boolean).slice(0, 2);
  const activeAssignments = classroom.activeAssignments ?? classroom.assignmentCount ?? 0;
  const studentCount = classroom.studentCount ?? classroom.students?.length ?? 0;

  return (
    <div
      onClick={() => onViewDashboard(classroom._id)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-5 px-5 py-4 group"
    >
      
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
        style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}>
        {classroom.name?.charAt(0)?.toUpperCase()}
      </div>

  
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] text-gray-800 truncate">{classroom.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {tags.map((tag, i) => {
            const { bg, text } = getTagColor(tag, i);
            return (
              <span key={tag} className={`${bg} ${text} text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide`}>
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      
      <div className="hidden sm:flex items-center gap-6 flex-shrink-0 text-sm">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Users size={13} className="text-gray-400" />
          <span className="font-semibold">{studentCount}</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: "#5bc0be" }}>
          <BookOpen size={13} />
          <span className="font-semibold">{activeAssignments}</span>
        </div>
        {classroom.accessCode && (
          <code className="text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
            {classroom.accessCode}
          </code>
        )}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          classroom.status === "archived" ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-600"
        }`}>
          {classroom.status === "archived" ? "ARCHIVED" : "ACTIVE"}
        </span>
      </div>

      <ArrowRight size={15} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </div>
  );
}


function CreateCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-teal-400 hover:bg-teal-50/20 transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-teal-400 transition-colors"
        style={{ background: "rgba(91,192,190,0.08)" }}>
        <Plus size={20} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
      </div>
      <div className="text-center px-4">
        <p className="font-bold text-gray-600 text-sm group-hover:text-gray-800 transition-colors">New Classroom</p>
        <p className="text-xs text-gray-400 mt-1">Set up a workspace and invite students</p>
      </div>
    </button>
  );
}


function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="flex gap-4">
          <div className="h-7 bg-gray-100 rounded w-16" />
          <div className="h-7 bg-gray-100 rounded w-16" />
        </div>
        <div className="h-9 bg-gray-100 rounded-xl mt-2" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex items-center gap-5 px-5 py-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 bg-gray-100 rounded w-1/3" />
        <div className="h-2.5 bg-gray-100 rounded w-1/5" />
      </div>
      <div className="flex gap-4">
        <div className="h-6 w-12 bg-gray-100 rounded" />
        <div className="h-6 w-12 bg-gray-100 rounded" />
      </div>
    </div>
  );
}


const PAGE_SIZE = 8;

export default function AllClasses() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); 

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await classroomService.getMyClassrooms({ isArchived: activeFilter === "archived" });
      const list = res?.data?.teaching ?? res?.data?.all ?? [];
      setClassrooms(list);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);
  useEffect(() => { setCurrentPage(1); }, [search, activeFilter]);

  const handleViewDashboard = (id) => navigate(`/instructor/classrooms/${id}`);

  const filtered = classrooms.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.batch?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil((filtered.length + (activeFilter === "active" ? 1 : 0)) / PAGE_SIZE));
  const isLastPage = currentPage === totalPages;
  const slotsAvailable = isLastPage && activeFilter === "active" ? PAGE_SIZE - 1 : PAGE_SIZE;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + slotsAvailable);
  const showCreateCard = activeFilter === "active" && isLastPage;

  const isEmpty = !loading && filtered.length === 0;

  return (
    <div
      className="w-full min-h-screen px-6 py-8"
      style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}
    >
      <CreateClassModal
        open={showModal}
        onClose={() => { setShowModal(false); fetchClassrooms(); }}
        onCreated={() => fetchClassrooms()}
      />

   
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
            Teaching
          </span>
          <h1 className="text-white text-2xl font-extrabold italic leading-tight">All Classes</h1>
          <p className="text-gray-400 text-[13px] mt-0.5">
            Manage and monitor your ongoing and past teaching sessions
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 flex-shrink-0 self-start sm:self-center"
          style={{ background: "#5bc0be" }}
        >
          <Plus size={16} /> New Classroom
        </button>
      </div>

      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        
        <div className="relative flex-1 max-w-lg">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by name, subject or batch…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
        
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            {[
              { key: "active",   label: "Active" },
              { key: "archived", label: "Archived" },
            ].map(({ key, label }) => (
              <button
                key={key} onClick={() => setActiveFilter(key)}
                className="px-5 py-2.5 text-sm font-semibold capitalize transition-all cursor-pointer flex items-center gap-1.5"
                style={activeFilter === key
                  ? { background: "linear-gradient(135deg,#0d1b2a,#1a2e45)", color: "white" }
                  : { color: "#6B7280" }}
              >
                {key === "archived" && <Archive size={13} />}
                {label}
              </button>
            ))}
          </div>

         
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className="p-2.5 transition-all"
              style={viewMode === "grid" ? { background: "linear-gradient(135deg,#0d1b2a,#1a2e45)", color: "white" } : { color: "#9CA3AF" }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-2.5 transition-all"
              style={viewMode === "list" ? { background: "linear-gradient(135deg,#0d1b2a,#1a2e45)", color: "white" } : { color: "#9CA3AF" }}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

     
      {!loading && filtered.length > 0 && (
        <p className="text-[12px] text-gray-400 mb-4 font-medium">
          {filtered.length} classroom{filtered.length !== 1 ? "s" : ""} found
          {search && <> for "<span className="text-gray-600 font-semibold">{search}</span>"</>}
        </p>
      )}

      
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            : isEmpty && activeFilter === "active"
              ? <CreateCard onClick={() => setShowModal(true)} />
              : isEmpty
                ? (
                  <div className="col-span-4 py-24 flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                      {activeFilter === "archived" ? <Archive size={28} className="text-gray-300" /> : <BookOpen size={28} className="text-gray-300" />}
                    </div>
                    <p className="text-gray-600 font-semibold text-sm">
                      {search ? `No classes match "${search}"` : activeFilter === "archived" ? "No archived classes" : "No active classes yet"}
                    </p>
                    <p className="text-gray-400 text-xs max-w-xs">
                      {search ? "Try a different search term." : activeFilter === "archived" ? "Classes you archive will appear here." : "Create your first classroom to get started."}
                    </p>
                    {search
                      ? <button onClick={() => setSearch("")} className="text-xs text-teal-500 font-semibold underline cursor-pointer mt-1">Clear search</button>
                      : activeFilter === "archived"
                        ? <button onClick={() => setActiveFilter("active")} className="text-xs text-teal-500 font-semibold underline cursor-pointer mt-1">Back to active classes</button>
                        : <button onClick={() => setShowModal(true)} className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "#5bc0be" }}><Plus size={14} /> Create Classroom</button>
                    }
                  </div>
                )
                : (
                  <>
                    {pageItems.map((c) => <ClassCard key={c._id} classroom={c} onViewDashboard={handleViewDashboard} />)}
                    {showCreateCard && <CreateCard onClick={() => setShowModal(true)} />}
                  </>
                )
          }
        </div>
      )}

     
      {viewMode === "list" && (
        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            : isEmpty
              ? (
                <div className="py-24 flex flex-col items-center gap-3 text-center bg-white rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <BookOpen size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-600 font-semibold text-sm">No classrooms found</p>
                  {activeFilter === "active" && (
                    <button onClick={() => setShowModal(true)}
                      className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
                      style={{ background: "#5bc0be" }}>
                      <Plus size={14} /> Create Classroom
                    </button>
                  )}
                </div>
              )
              : pageItems.map((c) => <ClassRow key={c._id} classroom={c} onViewDashboard={handleViewDashboard} />)
          }
        </div>
      )}

     
      {!loading && filtered.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}