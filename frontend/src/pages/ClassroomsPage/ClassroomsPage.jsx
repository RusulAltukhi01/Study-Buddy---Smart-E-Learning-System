import { useEffect, useState } from "react";
import classroomService from "../../services/classroomService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  BookOpen,
  ArrowRight,
  School,
  GraduationCap,
  Layers,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";


const COVER_GRADIENTS = [
  ["#064e3b", "#059669"],
  ["#065f46", "#34d399"],
  ["#047857", "#6ee7b7"],
  ["#0f766e", "#2dd4bf"],
  ["#0369a1", "#38bdf8"],
  ["#7c3aed", "#a78bfa"],
];

const LEVEL_CONFIG = {
  beginner:     { bg: "bg-emerald-100", text: "text-emerald-700" },
  intermediate: { bg: "bg-amber-100",   text: "text-amber-700"   },
  advanced:     { bg: "bg-red-100",     text: "text-red-600"     },
};

function getGradient(name = "") {
  return COVER_GRADIENTS[(name.charCodeAt(0) || 0) % COVER_GRADIENTS.length];
}


function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-28 bg-gray-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}


function ClassroomCard({ classroom, role, onClick }) {
  const [g1, g2] = getGradient(classroom.name);
  const level = classroom.level?.toLowerCase();
  const levelStyle = LEVEL_CONFIG[level] || { bg: "bg-gray-100", text: "text-gray-600" };
  const initials = classroom.name
    ?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      
      <div
        className="relative h-28 flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)` }}
      >
   
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <span className="text-4xl font-black text-white/20 select-none tracking-tighter">
          {initials}
        </span>
     
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {role === "instructor" ? "Teaching" : "Enrolled"}
          </span>
        </div>
      </div>

   
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <div>
          <h3 className="font-bold text-gray-800 text-[14px] leading-snug line-clamp-1">
            {classroom.name}
          </h3>
          {classroom.subject && (
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">{classroom.subject}</p>
          )}
        </div>

        {classroom.description && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
            {classroom.description}
          </p>
        )}

        <div className="flex items-center gap-2.5 mt-auto pt-2.5 border-t border-gray-50">
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <Users size={11} className="text-gray-400" />
            {classroom.students?.length || 0}
          </span>
          {classroom.level && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelStyle.bg} ${levelStyle.text}`}>
              {classroom.level}
            </span>
          )}
          <span className="ml-auto text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}


function EmptyState({ tab, onAction, isInstructor }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
        <School size={28} className="text-emerald-300" />
      </div>
      <h3 className="font-bold text-lg text-gray-800 mb-1">
        {tab === "teaching"
          ? "No classrooms yet"
          : tab === "enrolled"
            ? "Not enrolled anywhere"
            : "No classrooms found"}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        {tab === "teaching"
          ? "Create your first classroom and start teaching."
          : tab === "enrolled"
            ? "Join a classroom using an access code from your instructor."
            : "You haven't created or joined any classrooms yet."}
      </p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)" }}
      >
        <Plus size={15} />
        {isInstructor && tab !== "enrolled" ? "Create a Classroom" : "Join a Classroom"}
      </button>
    </div>
  );
}


const TABS = [
  { key: "all",      label: "All",      icon: Layers       },
  { key: "teaching", label: "Teaching", icon: GraduationCap },
  { key: "enrolled", label: "Enrolled", icon: BookOpen      },
];

const ClassroomsPage = () => {
  const { user } = useAuth();
  const isInstructor = user?.role === "instructor";

  const [classrooms, setClassrooms] = useState({ all: [], teaching: [], enrolled: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchMyClassrooms(); }, []);

  const fetchMyClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomService.getMyClassrooms();
      if (response.data) {
        setClassrooms({
          all:      response.data.all      || [],
          teaching: response.data.teaching || [],
          enrolled: response.data.enrolled || [],
        });
      }
    } catch {
      toast.error("Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (classroom) => {
    const isTeaching = classrooms.teaching.some((c) => c._id === classroom._id);
    navigate(isTeaching
      ? `/instructor/classrooms/${classroom._id}`
      : `/student/classrooms/${classroom._id}`
    );
  };

  const getRoleForClassroom = (classroom) =>
    classrooms.teaching.some((c) => c._id === classroom._id) ? "instructor" : "student";

  const raw = activeTab === "all" ? classrooms.all : classrooms[activeTab];
  const displayed = search.trim()
    ? raw.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.subject?.toLowerCase().includes(search.toLowerCase()),
      )
    : raw;

  return (
    <div className="w-full min-h-screen flex flex-col gap-5 p-4 sm:p-6 lg:p-7 overflow-x-hidden box-border"
      style={{ backgroundColor: "#f3f4f6" }}>

 
      <header
        className="relative overflow-hidden w-full rounded-[24px] px-6 py-8 sm:px-8 sm:py-10 border border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-5"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 80%, #059669 100%)" }}
      >
      
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)", transform: "translate(-50%, 40%)" }} />

        <div className="relative z-10 flex flex-col gap-2 min-w-0">
          <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-300 bg-emerald-300/10 px-2 py-0.5 rounded-full w-fit">
            Learning
          </span>
          <h1 className="text-white text-xl sm:text-2xl font-extrabold italic leading-tight">
            My Classrooms
          </h1>
          <p className="text-[13px] text-emerald-200/70 mt-0.5">
            {classrooms.all.length} classroom{classrooms.all.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate("/join")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-emerald-900 transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: "#34d399" }}
          >
            <Plus size={15} /> Join Class
          </button>
          {isInstructor && (
            <button
              onClick={() => navigate("/instructor/classrooms/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:bg-white/20 flex-shrink-0 border border-white/20 bg-white/10"
            >
              <Plus size={15} /> New Classroom
            </button>
          )}
        </div>
      </header>

    
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">

       
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex-shrink-0">
          {TABS.filter((tab) => isInstructor || tab.key !== "teaching").map(({ key, label, icon: Icon }) => {
            const count = key === "all" ? classrooms.all.length : classrooms[key].length;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSearch(""); }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
                style={isActive
                  ? { background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)" }
                  : {}}
              >
                <Icon size={13} />
                <span className="hidden xs:inline">{label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

       
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search classrooms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {!loading && search && (
          <p className="text-xs text-gray-400 font-medium flex-shrink-0">
            {displayed.length} result{displayed.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>


      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState tab={activeTab} isInstructor={isInstructor} onAction={() => navigate("/join")} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((classroom) => (
            <ClassroomCard
              key={classroom._id}
              classroom={classroom}
              role={getRoleForClassroom(classroom)}
              onClick={() => handleCardClick(classroom)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassroomsPage;