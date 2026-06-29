import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../UI/Loader/Loader";
import StudentDetails from "../StudentDetails/StudentDetails";
import { useAuth } from "../../contexts/AuthContext";
import { getImageUrl } from "../../utils/getImageUrl";
import {
  Search,
  X,
  Eye,
  MessageSquare,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";
const TABS = ["All Students", "Active", "Archived"];
const ITEMS_PER_PAGE = 10;


function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const BADGE_COLORS = [
  { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200"   },
  { bg: "bg-purple-50", text: "text-purple-700",  border: "border-purple-200" },
  { bg: "bg-blue-50",   text: "text-blue-700",    border: "border-blue-200"   },
  { bg: "bg-rose-50",   text: "text-rose-700",    border: "border-rose-200"   },
  { bg: "bg-amber-50",  text: "text-amber-700",   border: "border-amber-200"  },
];


function Avatar({ student }) {
  const fullName = `${student.firstName} ${student.lastName}`;
  if (student.profilePicture) {
    return (
      <img
        src={getImageUrl(student.profilePicture)}
        alt={fullName}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ring-2 ring-white shadow-sm"
      style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
    >
      {getInitials(student.firstName, student.lastName)}
    </div>
  );
}


function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}


function EmptyState({ search, activeTab }) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="py-20 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-1">
            <Users size={28} className="text-gray-200" />
          </div>
          <p className="text-gray-600 font-semibold text-sm">
            {search
              ? `No students match "${search}"`
              : activeTab === "Archived"
              ? "No archived students"
              : "No students found"}
          </p>
          <p className="text-gray-400 text-xs max-w-xs">
            {search
              ? "Try adjusting your search term."
              : "Students who enroll in your classrooms will appear here."}
          </p>
        </div>
      </td>
    </tr>
  );
}


const InstructorStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Students");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/instructor/students`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Status:", err.response?.status);
        console.error("Message:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  function viewStudentAccount(studentId) {
    const student = students.find((s) => s._id === studentId);
    setSelectedStudent(student);
  }


  const uniqueClassrooms = [
    ...new Set(
      students.flatMap((s) => s.classroomsEnrolled?.map((e) => e.classroom?._id) || [])
    ),
  ].length;

  const filtered = students.filter((s) => {
    const matchSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "Active")   return matchSearch && s.lastActive;
    if (activeTab === "Archived") return matchSearch && !s.lastActive;
    return matchSearch;
  });

  const tabCounts = {
    "All Students": students.length,
    Active:   students.filter((s) => s.lastActive).length,
    Archived: students.filter((s) => !s.lastActive).length,
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5)           return i + 1;
    if (currentPage <= 3)          return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });


  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}>
        <Loader />
      </div>
    );
  }

  return (
    <>
      {selectedStudent && (
        <StudentDetails student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      <div
        className="w-full min-h-screen px-6 py-8"
        style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}
      >
       
        <div
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
        >
  
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#5bc0be 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#6c63ff 0%,transparent 70%)", transform: "translateY(40%)" }} />

          <div className="relative z-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
              Instructor Panel
            </span>
            <h1 className="text-white text-2xl font-extrabold mt-2 italic">All Students</h1>
            <p className="text-gray-400 text-[13px] mt-1">
              Managing{" "}
              <span className="text-cyan-400 font-bold">{students.length.toLocaleString()}</span>{" "}
              students across{" "}
              <span className="text-cyan-400 font-bold">{uniqueClassrooms}</span>{" "}
              active batches.
            </p>
          </div>

       
          <div className="relative z-10 flex items-center gap-3 mt-5 flex-wrap">
            {[
              { label: "Total",    value: tabCounts["All Students"], color: "text-white",      bg: "bg-white/10" },
              { label: "Active",   value: tabCounts["Active"],        color: "text-emerald-400", bg: "bg-emerald-400/10" },
              { label: "Inactive", value: tabCounts["Archived"],      color: "text-gray-400",    bg: "bg-white/5" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl px-4 py-2 flex items-center gap-2`}>
                <GraduationCap size={14} className={color} />
                <span className={`text-sm font-bold ${color}`}>{value.toLocaleString()}</span>
                <span className="text-gray-500 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

    
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
         
          <div className="flex items-center gap-1 flex-shrink-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={isActive
                    ? { background: "linear-gradient(135deg,#0d1b2a,#1a2e45)", color: "white" }
                    : { color: "#6B7280" }}
                >
                  {tab}
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={isActive
                      ? { background: "rgba(255,255,255,0.15)", color: "white" }
                      : { background: "#f3f4f6", color: "#9CA3AF" }}
                  >
                    {tabCounts[tab].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>

       
          <div className="hidden sm:block w-px h-6 bg-gray-100 mx-1" />

         
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setCurrentPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

        
          {!loading && (
            <p className="text-[12px] text-gray-400 flex-shrink-0">
              <span className="font-semibold text-gray-600">{filtered.length}</span> results
            </p>
          )}
        </div>

       
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Student", "Email", "Enrolled", "Classes", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <EmptyState search={search} activeTab={activeTab} />
                ) : (
                  paginated.map((student, rowIdx) => {
                    const fullName = `${student.firstName} ${student.lastName}`;
                    return (
                      <tr
                        key={student._id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                     
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar student={student} />
                            <div>
                              <p className="font-semibold text-gray-800 text-[13px] leading-snug">
                                {fullName}
                              </p>
                              {student.lastActive ? (
                                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                  Active
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">Inactive</span>
                              )}
                            </div>
                          </div>
                        </td>

                     
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] text-gray-500 font-medium">
                            {student.email}
                          </span>
                        </td>

                      
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] text-gray-500">
                            {formatDate(student.enrollmentDate)}
                          </span>
                        </td>

                      
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                            {student.classroomsEnrolled?.length > 0 ? (
                              student.classroomsEnrolled.map((enrollment, i) => {
                                const c = BADGE_COLORS[i % BADGE_COLORS.length];
                                return (
                                  <span
                                    key={i}
                                    className={`${c.bg} ${c.text} border ${c.border} text-[10px] font-bold px-2 py-0.5 rounded-lg`}
                                  >
                                    {enrollment.classroom?.name || "—"}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[12px] text-gray-400 italic">No classes</span>
                            )}
                          </div>
                        </td>

                    
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              title="View profile"
                              onClick={() => viewStudentAccount(student._id)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:text-white hover:border-transparent transition-all cursor-pointer"
                              style={{ "--hover-bg": "#1a2e45" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#1a2e45"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              title="Message"
                              className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:text-white transition-all cursor-pointer"
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#5bc0be"; e.currentTarget.style.borderColor = "#5bc0be"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

         
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[12px] text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-gray-600">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-600">
                  {filtered.length.toLocaleString()}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border transition-all cursor-pointer"
                    style={
                      currentPage === page
                        ? { background: "linear-gradient(135deg,#0d1b2a,#1a2e45)", color: "white", borderColor: "transparent" }
                        : { color: "#6B7280", borderColor: "#E5E7EB" }
                    }
                  >
                    {page}
                  </button>
                ))}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-400 px-1 text-sm">…</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border border-gray-200 text-gray-500 hover:border-gray-300 transition-all cursor-pointer"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InstructorStudents;