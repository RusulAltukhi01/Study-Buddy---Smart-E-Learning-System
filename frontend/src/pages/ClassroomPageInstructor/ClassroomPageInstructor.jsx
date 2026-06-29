import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classroomService from "../../services/classroomService";
import assignmentService from "../../services/assignmentService";
import { toast } from "sonner";
import Loader from "../../UI/Loader/Loader";
import {
  CalendarSync,
  FileQuestionMark,
  Plus,
  Smile,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  UserPlus,
  Star,
  ExternalLink,
  Zap,
  Copy,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import NavigatedTabs from "../../components/NavigatedTabs/NavigatedTabs";
import Feed from "../../components/Feed/Feed";
import Students from "../../components/Students/Students";
import AddedAssignments from "../../components/AddedAssignments/AddedAssignments";
import AssignCourse from "../../components/AssignCourse/AssignCourse";
import AssignQuiz from "../../components/AssignQuiz/AssignQuiz";
import { useClassroom } from "../../contexts/ClassroomContext";
import CreateClassroomButton from "../../components/CreateClassroomButton/CreateClassroomButton";



const resolveActivityMeta = (type) => {
  switch (type) {
    case "join":      return { icon: <UserPlus  size={15} className="text-blue-500"   />, iconBg: "bg-blue-50"   };
    case "submit":    return { icon: <CheckCircle size={15} className="text-violet-500" />, iconBg: "bg-violet-50" };
    case "grade":     return { icon: <Star       size={15} className="text-yellow-500" />, iconBg: "bg-yellow-50" };
    case "alert":
    case "plagiarism":return { icon: <AlertCircle size={15} className="text-amber-500"  />, iconBg: "bg-amber-50"  };
    default:          return { icon: <BookOpen   size={15} className="text-gray-400"   />, iconBg: "bg-gray-50"   };
  }
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  
  if (mins < 60) return `${mins}M AGO`;
  
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  
  const days = Math.floor(hrs / 24);
  

  if (days > 7) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }
  
  return `${days}D AGO`;
};



const StatCard = ({ s }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>{s.icon}</div>
      {s.delta && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.deltaPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
          {s.delta}
        </span>
      )}
      {s.tag && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.tag === "Good" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
          {s.tag}
        </span>
      )}
      {s.priority && (
        <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{s.priority}</span>
      )}
    </div>
    <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
    {s.loading
      ? <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
      : <p className="text-3xl font-extrabold text-gray-700 leading-none">{s.value}</p>}
  </div>
);


const ClassroomPageInstructor = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { openCreateModal } = useClassroom();

  const [classroom,       setClassroom]       = useState(null);
  const [activity,        setActivity]        = useState([]);
  const [otherClassrooms, setOtherClassrooms] = useState([]);
  const [assignments,     setAssignments]     = useState([]);

  const [loading,           setLoading]           = useState(true);
  const [activityLoading,   setActivityLoading]   = useState(true);
  const [classroomsLoading, setClassroomsLoading] = useState(true);
  const [statsLoading,      setStatsLoading]      = useState(true);

  const [activeTab, setActiveTab] = useState("feed");

  const [stats, setStats] = useState({
    avgGrade: "0%", avgGradeDelta: "0%",
    completionRate: "0%", activeStudents: 0, pendingSubmissions: 0,
  });

  const navigatedTabsNames = ["feed", "students", "courses", "quizzes", "assignments"];


  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const response = await classroomService.getClassroomById(classroomId);
        setClassroom(response.data);
      } catch (error) {
        toast.error(error.error || "Failed to load classroom");
        navigate("/classrooms");
      } finally {
        setLoading(false);
      }
    };
    fetchClassroom();
  }, [classroomId, navigate]);

  useEffect(() => {
    if (!classroom) return;
    const fetchAssignmentsAndStats = async () => {
      try {
        setStatsLoading(true);
        const response = await assignmentService.getAssignments({ classroomId, limit: 100 });
        const allAssignments = response.data || [];
        setAssignments(allAssignments);

        let totalPoints = 0, totalEarnedPoints = 0, gradedSubmissions = 0;
        const studentCount = classroom?.studentCount || classroom?.students?.length || 0;

        allAssignments.forEach((assignment) => {
          if (assignment.submissions?.length > 0) {
            assignment.submissions.forEach((submission) => {
              if (submission.score !== null && submission.score !== undefined) {
                totalEarnedPoints += submission.score;
                totalPoints += assignment.points;
                gradedSubmissions++;
              }
            });
          }
        });

        let avgGrade = totalPoints > 0
          ? (totalEarnedPoints / totalPoints) * 100
          : gradedSubmissions > 0 ? (totalEarnedPoints / gradedSubmissions / 100) * 100 : 0;

        let completionRate = 0;
        if (studentCount > 0 && allAssignments.length > 0) {
          const studentsWithSubs = new Set();
          allAssignments.forEach((a) => a.submissions?.forEach((s) => { if (s.student) studentsWithSubs.add(s.student.toString()); }));
          completionRate = (studentsWithSubs.size / studentCount) * 100;
        }

        const pendingSubmissions = allAssignments.reduce((count, a) => {
          if (a.submissions) return count + a.submissions.filter((s) => s.status !== "graded" && s.submittedAt).length;
          return count;
        }, 0);

        setStats({
          avgGrade: `${Math.round(avgGrade)}%`,
          avgGradeDelta: avgGrade > 0 ? `+${Math.round(avgGrade / 10)}%` : "0%",
          completionRate: `${Math.round(completionRate)}%`,
          activeStudents: studentCount,
          pendingSubmissions,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({ avgGrade: "0%", avgGradeDelta: "0%", completionRate: "0%", activeStudents: classroom?.studentCount || 0, pendingSubmissions: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchAssignmentsAndStats();
  }, [classroomId, classroom]);


  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await classroomService.getRecentActivity(classroomId);
        setActivity(response.data ?? []);
      } catch { setActivity([]); }
      finally { setActivityLoading(false); }
    };
    fetchActivity();
  }, [classroomId]);


  useEffect(() => {
    const fetchOtherClassrooms = async () => {
      try {
        const response = await classroomService.getInstructorClassrooms();
        setOtherClassrooms((response.data ?? []).filter(
          (c) => String(c.id) !== String(classroomId) && String(c._id) !== String(classroomId)
        ));
      } catch { setOtherClassrooms([]); }
      finally { setClassroomsLoading(false); }
    };
    fetchOtherClassrooms();
  }, [classroomId]);

  const handleCopyCode = async () => {
    try { await navigator.clipboard.writeText(classroom.accessCode); toast.success("Join code copied!"); }
    catch { toast.error("Failed to copy code"); }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "feed":        return <Feed classroomId={classroomId} />;
      case "students":    return <Students classroomId={classroomId} />;
      case "courses":     return <AssignCourse />;
      case "quizzes":     return <AssignQuiz />;
      case "assignments": return <AddedAssignments classroomId={classroomId} />;
      default:            return null;
    }
  };

  const STATS = [
    { id: "grade",      label: "Avg. Grade",           value: stats.avgGrade,                   delta: stats.avgGradeDelta, deltaPositive: parseFloat(stats.avgGradeDelta) >= 0, icon: <TrendingUp size={18} className="text-emerald-500" />, bg: "bg-emerald-50", loading: statsLoading },
    { id: "completion", label: "Completion Rate",       value: stats.completionRate,             tag: parseFloat(stats.completionRate) >= 70 ? "Good" : "Needs Improvement",                                                                    icon: <CheckCircle size={18} className="text-blue-400"    />, bg: "bg-blue-50",    loading: statsLoading },
    { id: "active",     label: "Active Students",       value: stats.activeStudents.toString(),                                                                                                                                                   icon: <Users      size={18} className="text-violet-500"  />, bg: "bg-violet-50",  loading: statsLoading },
    { id: "pending",    label: "Pending Submissions",   value: stats.pendingSubmissions.toString(), priority: stats.pendingSubmissions > 0 ? "Needs Attention" : "All Graded",                                                                    icon: <AlertCircle size={18} className="text-rose-500"   />, bg: "bg-rose-50",    loading: statsLoading },
  ];


  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}>
      <Loader />
    </div>
  );
  if (!classroom) return (
    <div className="w-full text-center text-2xl font-bold mt-20 text-gray-600">Classroom not found</div>
  );

  const studentCount = classroom.studentCount || classroom.students?.length || 0;

  return (
    <main
      className="w-full min-h-screen font-sans"
      style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}
    >
      
      <div
        className="w-full px-6 pt-6 pb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
      >
   
        <div className=" absolute right-0 top-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle,#5bc0be 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle,#6c63ff 0%,transparent 70%)", transform: "translateY(50%)" }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full mx-auto">
          <div className="flex flex-col gap-2">
           
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <span className="hover:text-gray-300 cursor-pointer transition-colors" onClick={() => navigate("/instructor/all-classes")}>Classrooms</span>
              <ChevronRight size={12} />
              <span className="text-gray-400 truncate max-w-[200px]">{classroom.name}</span>
            </div>

        
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full w-fit">
              Classroom Dashboard
            </span>

            <h1 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              {classroom.name}
            </h1>

          
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Users size={13} />
                <span>{studentCount} student{studentCount !== 1 ? "s" : ""} enrolled</span>
              </div>
              {classroom.subject && (
                <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">{classroom.subject}</span>
              )}
              {classroom.batch && (
                <span className="text-[11px] font-semibold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">{classroom.batch}</span>
              )}
              {classroom.status && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${classroom.status === "archived" ? "bg-gray-700/50 text-gray-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  {classroom.status}
                </span>
              )}
              {classroom.accessCode && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-sm font-mono text-cyan-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg"
                >
                  <Copy size={12} /> {classroom.accessCode}
                </button>
              )}
            </div>
          </div>

      
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 cursor-pointer flex-shrink-0 self-start sm:self-center"
            style={{ background: "#5bc0be" }}
          >
            <Plus size={16} /> New Module
          </button>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-6 flex flex-col gap-6">

        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => <StatCard key={s.id} s={s} />)}
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[15px] text-gray-700 mb-5">Recent Class Activity</h2>

            {activityLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-violet-400" />
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-10">
                <GraduationCap size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No recent activity yet.</p>
                <p className="text-xs text-gray-300 mt-1">Activities appear when students submit or receive grades.</p>
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-gray-50">
                {activity.map((item) => {
                  const { icon, iconBg } = resolveActivityMeta(item.type);
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium leading-snug">
                          <span className="font-bold">{item.name}</span>{" "}{item.action}{" "}
                          {item.link && item.type === "submit" && (
                            <span className="text-violet-600 font-semibold">{item.linkLabel ?? item.link}</span>
                          )}
                        </p>
                        {item.detail && <p className="text-xs text-gray-400 mt-0.5">{item.detail}</p>}
                        {item.tags?.length > 0 && (
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {item.tags.map((t) => (
                              <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${t === "PASSED" ? "bg-emerald-50 text-emerald-600" : t === "FAILED" ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-500"}`}>{t}</span>
                            ))}
                          </div>
                        )}
                        {item.link && (item.type === "alert" || item.type === "plagiarism") && (
                          <button className="flex items-center gap-1 text-xs text-violet-600 font-semibold mt-1.5 hover:text-violet-800 cursor-pointer">
                            {item.linkLabel ?? "Review"} <ExternalLink size={11} />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap mt-1">{formatRelativeTime(item.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

       
          <div className="flex flex-col gap-4">

            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-[15px] text-gray-700 mb-4">Other Classrooms</h2>

              {classroomsLoading ? (
                <div className="flex items-center justify-center py-6"><Loader /></div>
              ) : otherClassrooms.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No other classrooms found.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {otherClassrooms.slice(0, 5).map((c) => (
                    <li
                      key={c.id || c._id}
                      onClick={() => navigate(`/instructor/classrooms/${c.id || c._id}`)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#0d1b2a,#1a2e45)" }}>
                          {c.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-700 leading-tight truncate max-w-[140px]">{c.name}</p>
                          <p className="text-[11px] text-gray-400">{c.studentCount || c.students?.length || 0} students</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center mb-3">Need more workspaces?</p>
                <CreateClassroomButton onClick={openCreateModal} variant="secondary" className="w-full" />
              </div>
            </div>

           
            <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}>
              <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle,#5bc0be 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2 relative z-10">Instructor Insight</p>
              <p className="text-sm text-gray-300 leading-relaxed italic relative z-10">
                {stats.pendingSubmissions > 0
                  ? `${stats.pendingSubmissions} submission${stats.pendingSubmissions > 1 ? "s" : ""} pending grading. Average grade is ${stats.avgGrade}. Keep up the good work!`
                  : `Great job! All submissions have been graded. The class average is ${stats.avgGrade} with a ${stats.completionRate} completion rate.`}
              </p>
              <div className="absolute bottom-4 right-4 z-10">
                <Zap size={18} className="text-yellow-300 fill-yellow-300 opacity-60" />
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <NavigatedTabs
            navigatedTabsNames={navigatedTabsNames}
            activeTab={activeTab}
            onTabClick={setActiveTab}
          />
          <div className="px-6 pb-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ClassroomPageInstructor;