import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  CheckCircle,
  ListTodo,
  NotebookPen,
  ArrowRight,
  Grid2x2,
  Calendar,
  Plus,
  Check,
  ChevronRight,
  Clock,
  Users,
  Loader2,
  CalendarDays,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import classroomService from "../../services/classroomService";
import { useAuth } from "../../contexts/AuthContext";
import { getImageUrl } from "../../utils/getImageUrl";


const getInitials = (firstName = "", lastName = "") =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const getInstructorName = (instructor) => {
  if (!instructor) return "Unknown Instructor";
  if (typeof instructor === "string") return instructor;
  return `${instructor.firstName ?? ""} ${instructor.lastName ?? ""}`.trim();
};

const getUpcomingFromTasks = (tasks) => {
  const now = new Date();
  return tasks
    .filter((t) => t.status !== "completed" && new Date(t.dateTime) > now)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 3);
};

const formatScheduleDate = (dateTime) => {
  const d = new Date(dateTime);
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};


const HeroBanner = ({ firstName, pendingTasks, enrolledCount }) => (
  <div
    className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between overflow-hidden relative gap-4"
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
        Student Dashboard
      </span>
      <h1 className="text-white text-3xl sm:text-[2.2rem] font-extrabold leading-tight">
        Welcome back,{" "}
        <span className="italic" style={{ color: "#6ee7b7" }}>
          {firstName}!
        </span>
      </h1>
      <p className="text-emerald-200 text-[13px]">
        {pendingTasks > 0 ? (
          <>
            You have{" "}
            <span className="text-white font-bold">{pendingTasks} pending task{pendingTasks !== 1 ? "s" : ""}</span>{" "}
            this week. Let's keep the momentum going.
          </>
        ) : (
          "You're all caught up! Great work."
        )}
      </p>
    </div>

    <div className="flex flex-col items-start sm:items-end gap-2 relative z-10 shrink-0">
      <div className="flex items-center gap-1.5 text-emerald-300 text-[12px]">
        <CalendarDays size={13} />
        <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
      </div>
      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
        <Sparkles size={13} className="text-emerald-300" />
        <span className="text-white text-[12px] font-semibold">{enrolledCount} classroom{enrolledCount !== 1 ? "s" : ""} enrolled</span>
      </div>
    </div>
  </div>
);


const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col gap-2 border border-gray-100 shadow-sm flex-1 min-w-0">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: bg }}
    >
      <Icon size={18} color={color} />
    </div>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mt-1">
      {label}
    </p>
    {loading ? (
      <div className="h-8 w-12 bg-gray-100 animate-pulse rounded-lg" />
    ) : (
      <p className="text-3xl font-extrabold text-gray-700 leading-none">{value}</p>
    )}
  </div>
);


const NextUpCard = ({ classroom, loading, onNavigate }) => {
  if (loading) {
    return <div className="rounded-2xl p-5 h-44 animate-pulse bg-gray-100" />;
  }
  if (!classroom) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center min-h-[140px] bg-emerald-50 border border-emerald-100">
        <p className="text-emerald-600 text-sm font-semibold">No classrooms yet.</p>
        <p className="text-emerald-400 text-xs mt-1">Join a classroom using the panel on the right.</p>
      </div>
    );
  }
  const instructor = getInstructorName(classroom.instructor);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)" }}
    >
      <div className="p-5 sm:p-6">
        <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-300 bg-emerald-300/10 px-2 py-0.5 rounded-full">
          Most Recent Classroom
        </span>
        <h2 className="text-white font-extrabold text-xl mt-3 leading-snug line-clamp-2">
          {classroom.name}
        </h2>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-emerald-200 text-[12px]">
          <span className="flex items-center gap-1">
            <Users size={12} /> {instructor}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {classroom.students?.length ?? 0} students
          </span>
        </div>
        <button
          onClick={() => onNavigate(classroom._id)}
          className="mt-4 flex items-center gap-2 text-[13px] font-bold px-5 py-2.5 cursor-pointer rounded-xl transition-opacity hover:opacity-90"
          style={{ background: "#34d399", color: "#064e3b" }}
        >
          Continue Learning <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};


const SchedulePanel = ({ tasks, loading }) => {
  const upcoming = getUpcomingFromTasks(tasks);
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-600 text-[15px]">Upcoming Schedule</h3>
        <Calendar size={16} className="text-gray-400" />
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <p className="text-[12px] text-gray-400 text-center py-4">No upcoming tasks scheduled.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((task) => {
            const { month, day, time } = formatScheduleDate(task.dateTime);
            return (
              <div key={task.id} className="flex gap-3 items-start">
                <div className="text-center min-w-[36px]">
                  <p className="text-[9px] font-bold uppercase text-gray-400">{month}</p>
                  <p className="text-lg font-extrabold text-gray-700 leading-none">{day}</p>
                </div>
                <div className="border-l border-gray-200 pl-3 flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-700 leading-snug truncate">{task.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const TaskPanel = ({
  tasks, onToggle, onInputChange, newTask, newTaskDeadline,
  onDeadlineChange, onAddWithDeadline,
}) => {
  const incomplete = tasks.filter((t) => t.status !== "completed").length;
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-600 text-[15px]">Task List</h3>
        {incomplete > 0 && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {incomplete} left
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 list-none p-0">
        {tasks.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-3">No tasks yet. Add one below!</p>
        ) : (
          tasks.slice(0, 6).map((task) => {
            const done = task.status === "completed";
            const isOverdue = !done && new Date(task.dateTime) < new Date();
            return (
              <li key={task.id} className="flex flex-col gap-1 group font-semibold">
                <div className="flex items-center gap-2.5 cursor-pointer">
                  <span
                    onClick={() => onToggle(task.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors ${
                      done ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-emerald-400"
                    }`}
                  >
                    {done && <Check size={10} color="white" strokeWidth={3} />}
                  </span>
                  <span
                    onClick={() => onToggle(task.id)}
                    className={`text-[13px] flex-1 min-w-0 truncate transition-colors ${
                      done ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                {task.dateTime && !done && (
                  <div className={`text-[10px] ml-6 flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                    <Clock size={10} />
                    {isOverdue ? "Overdue: " : "Due: "}
                    {new Date(task.dateTime).toLocaleDateString()} at{" "}
                    {new Date(task.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 mb-2">
          <input
            value={newTask}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent"
            onKeyDown={(e) => e.key === "Enter" && onAddWithDeadline()}
          />
          <button
            onClick={() => setShowDeadlinePicker(!showDeadlinePicker)}
            className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${
              showDeadlinePicker ? "bg-emerald-500 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <Calendar size={13} />
          </button>
          <button
            onClick={onAddWithDeadline}
            className="w-6 h-6 rounded-full bg-emerald-500 cursor-pointer hover:bg-emerald-600 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Plus size={13} color="white" />
          </button>
        </div>
        {showDeadlinePicker && (
          <div className="mt-2 p-3 bg-emerald-50 rounded-xl space-y-2 animate-fadeIn text-emerald-800 font-semibold">
            <input
              type="date"
              value={newTaskDeadline.date}
              onChange={(e) => onDeadlineChange({ ...newTaskDeadline, date: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white"
              min={new Date().toISOString().split("T")[0]}
            />
            <input
              type="time"
              value={newTaskDeadline.time}
              onChange={(e) => onDeadlineChange({ ...newTaskDeadline, time: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white"
            />
            <button onClick={() => setShowDeadlinePicker(false)} className="w-full text-[11px] text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


const ClassroomCard = ({ classroom, onNavigate }) => {
  const instructor = getInstructorName(classroom.instructor);
  const isActive = classroom.status === "active";

  return (
    <div
      onClick={() => onNavigate(classroom._id)}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-1 min-w-0 cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-3"
      style={{ minWidth: "180px" }}
    >
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold bg-emerald-50 text-emerald-600">
          {"</>"}
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isActive ? "ACTIVE" : (classroom.status ?? "").toUpperCase()}
        </span>
      </div>

      <div>
        <p className="font-bold text-[14px] text-gray-700 tracking-[0.6px] leading-snug line-clamp-2">
          {classroom.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {classroom.instructor?.profilePicture ? (
            <img
              src={getImageUrl(classroom?.instructor?.profilePicture)}
              alt={instructor}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-600">
              {getInitials(classroom.instructor?.firstName, classroom.instructor?.lastName).charAt(0)}
            </div>
          )}
          <p className="text-[11px] text-gray-400 truncate">{instructor}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold flex items-center gap-1">
          <Users size={9} /> {classroom.students?.length ?? 0} enrolled
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Joined{" "}
          {new Date(classroom.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          })}
        </p>
      </div>

      <button
        className="w-full text-[13px] font-bold py-2.5 rounded-xl cursor-pointer text-white mt-auto transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        onClick={(e) => { e.stopPropagation(); onNavigate(classroom._id); }}
      >
        Enter Classroom
      </button>
    </div>
  );
};


const ClassroomsSection = ({ classrooms, loading, onNavigate }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? classrooms : classrooms.slice(0, 2);

  if (loading) {
    return (
      <div className="flex gap-4 flex-wrap">
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 min-w-[180px] h-52 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
        <p className="text-gray-400 text-sm">No classrooms yet.</p>
        <p className="text-gray-400 text-xs mt-1">Join one using the panel on the right.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 flex-wrap">
        {visible.map((c) => (
          <ClassroomCard key={c._id} classroom={c} onNavigate={onNavigate} />
        ))}
      </div>
      {classrooms.length > 2 && (
        <button
          onClick={() => setShowAll((p) => !p)}
          className="text-[12px] font-semibold text-emerald-600 hover:underline self-start"
        >
          {showAll ? "Show less" : `See all ${classrooms.length} classrooms →`}
        </button>
      )}
    </div>
  );
};


const JoinClassroomPanel = ({ onJoin }) => {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setJoining(true);
    try {
      await classroomService.joinClassroom(trimmed);
      setCode("");
      onJoin?.();
    } catch (err) {
      console.log(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Users size={15} color="white" />
        </div>
        <p className="text-white font-bold text-[14px]">Join a Classroom</p>
      </div>
      <p className="text-emerald-200 text-[12px] leading-snug">
        Enter the invitation code provided by your instructor to instantly access your course materials.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="CODE-2024"
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-[13px] font-mono placeholder-white/40 outline-none focus:border-white/50"
      />
      <button
        onClick={handleJoin}
        disabled={joining || !code.trim()}
        className="w-full bg-white font-bold text-[13px] py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ color: "#064e3b" }}
      >
        {joining && <Loader2 size={14} className="animate-spin" />}
        {joining ? "Joining..." : "Join Now"}
      </button>
    </div>
  );
};


const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [classroomsLoading, setClassroomsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "23:59",
  });

  const fetchClassrooms = useCallback(async () => {
    if (!user?._id) return;
    setClassroomsLoading(true);
    try {
      const response = await classroomService.getMyClassrooms();
      if (response?.data?.enrolled) {
        const sorted = [...response.data.enrolled].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setClassrooms(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClassroomsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);

  useEffect(() => {
    if (!user?._id) return;
    const saved = localStorage.getItem(`studentTasks_${user._id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTasks(parsed.map((t) => ({ ...t, dateTime: new Date(t.dateTime) })));
      } catch (err) { console.log(err.message); }
    }
    setTasksLoaded(true);
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || !tasksLoaded) return;
    localStorage.setItem(`studentTasks_${user._id}`, JSON.stringify(tasks));
  }, [tasks, user?._id, tasksLoaded]);

  const handleToggle = (id) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "completed" ? "incomplete" : "completed" } : t,
      ),
    );

  const handleAddTaskWithDeadline = () => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    const deadlineDateTime = new Date(`${newTaskDeadline.date}T${newTaskDeadline.time}`);
    if (deadlineDateTime < new Date()) {
      alert("Please set a deadline in the future");
      return;
    }
    setTasks((prev) => [
      {
        id: Date.now(), title: trimmed, description: "", status: "incomplete",
        dateTime: deadlineDateTime, date: newTaskDeadline.date,
      },
      ...prev,
    ]);
    setNewTaskText("");
    setNewTaskDeadline({ date: new Date().toISOString().split("T")[0], time: "23:59" });
  };

  const totalEnrolled = classrooms.length;
  const totalCompleted = classrooms.filter((c) => c.status === "archived").length;
  const pendingTasks = tasks.filter((t) => t.status === "incomplete").length;
  const completionPct =
    tasks.length === 0
      ? 0
      : Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100);

  const stats = [
    { icon: BookOpenCheck, label: "Enrolled Courses",  value: String(totalEnrolled),  color: "#059669", bg: "#d1fae5", loading: classroomsLoading },
    { icon: CheckCircle,   label: "Completed",          value: String(totalCompleted), color: "#16a34a", bg: "#dcfce7", loading: classroomsLoading },
    { icon: NotebookPen,   label: "Assignments",        value: String(pendingTasks),   color: "#0891b2", bg: "#cffafe", loading: false },
    { icon: TrendingUp,    label: "Task Progress",      value: `${completionPct}%`,    color: "#7c3aed", bg: "#ede9fe", loading: false },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#f3f4f6" }}>
      <div className="w-full mx-auto px-4 sm:px-6 pt-6 pb-10 flex flex-col gap-5">

      
        <HeroBanner
          firstName={user?.firstName ?? "Student"}
          pendingTasks={pendingTasks}
          enrolledCount={totalEnrolled}
        />

        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

         
          <div className="lg:col-span-2 flex flex-col gap-5">

         
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-700 text-[15px]">Next Up</h2>
                <button
                  onClick={() => navigate("/student/classrooms")}
                  className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600 cursor-pointer hover:underline"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <NextUpCard
                classroom={classrooms[0] ?? null}
                loading={classroomsLoading}
                onNavigate={(id) => navigate(`/student/classrooms/${id}`)}
              />
            </div>

           
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-700 text-[15px]">My Classrooms</h2>
                <button className="text-gray-400 hover:text-gray-500">
                  <Grid2x2 size={15} />
                </button>
              </div>
              <ClassroomsSection
                classrooms={classrooms}
                loading={classroomsLoading}
                onNavigate={(id) => navigate(`/student/classrooms/${id}`)}
              />
            </div>
          </div>

          
          <div className="flex flex-col gap-4">
            <SchedulePanel tasks={tasks} loading={!tasksLoaded} />
            <TaskPanel
              tasks={tasks}
              onToggle={handleToggle}
              onInputChange={setNewTaskText}
              newTask={newTaskText}
              newTaskDeadline={newTaskDeadline}
              onDeadlineChange={setNewTaskDeadline}
              onAddWithDeadline={handleAddTaskWithDeadline}
            />
            <JoinClassroomPanel onJoin={fetchClassrooms} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;