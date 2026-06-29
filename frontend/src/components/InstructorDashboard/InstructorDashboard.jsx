import { useState, useEffect } from "react";
import {
  CirclePlus,
  GraduationCap,
  School,
  ClipboardList,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Users,
  Clock,
  BarChart2,
  Bell,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

import DashboardHeader from "../DashboardHeader/DashboardHeader";
import CreateRoomForm from "../../../forms/CreateRoomForm/CreateRoomForm";
import classroomService from "../../services/classroomService";
import courseService from "../../services/courseService";
import assignmentService from "../../services/assignmentService";

import StatsCard from "../Statscard/Statscard";
import DashboardClassroomCard from "../Dashboardclassroomcard/Dashboardclassroomcard";
import CurriculumSnapshot from "../Curriculumsnap/Curriculumsnap";
import AssignmentSnapShot from "../AssignmentSnapShot/AssignmentSnapShot";
import ActivityFeed from "../Activityfeed/Activityfeed";
import BarChartCard from "../BarChartCard/BarChartCard";
import {
  ClassroomProvider,
  useClassroom,
} from "../../contexts/ClassroomContext";
import CreateClassroomButton from "../CreateClassroomButton/CreateClassroomButton";


const MiniStatCard = ({ icon: Icon, label, value, sub, accent, loading }) => (
  <div className="bg-white rounded-2xl p-5 flex flex-col gap-2 border border-gray-100 shadow-sm flex-1 min-w-0">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: `${accent}1a` }}
    >
      <Icon size={20} color={accent} />
    </div>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mt-1">
      {label}
    </p>
    {loading ? (
      <div className="h-8 w-12 bg-gray-100 animate-pulse rounded-lg" />
    ) : (
      <p className="text-3xl font-extrabold text-gray-700 leading-none">
        {value}
      </p>
    )}
    {sub && !loading && <p className="text-[11px] text-gray-400">{sub}</p>}
  </div>
);


const HeroBanner = ({
  firstName,
  todaysClasses,
  todos,
  nextScheduledDate,
  upcomingExam,
  getDayContext,
}) => (
  <div
    className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
    style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
  >

    <div
      className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
      style={{
        background: "radial-gradient(circle, #5bc0be 0%, transparent 70%)",
        transform: "translate(30%, -30%)",
      }}
    />
    <div
      className="absolute left-1/2 bottom-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
      style={{
        background: "radial-gradient(circle, #6c63ff 0%, transparent 70%)",
        transform: "translate(-50%, 40%)",
      }}
    />

    <div className="flex flex-col gap-2 relative z-10">
      <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full w-fit">
        Instructor Dashboard
      </span>
      <h1 className="text-white text-[2.2rem] font-extrabold leading-tight">
        Hello,{" "}
        <span className="italic" style={{ color: "#5bc0be" }}>
          {firstName}!
        </span>
      </h1>
      <p className="text-gray-400 text-[13px]">
        You have <span className="text-white font-bold">{getDayContext()}</span>{" "}
        <span className="text-cyan-400 font-bold">
          {todaysClasses} {todaysClasses === 1 ? "class" : "classes"}
        </span>{" "}

        {nextScheduledDate && (
          <>
            {" "}
            · Upcoming {upcomingExam?.type === "exam"
              ? "exam"
              : "assignment"}{" "}
            <span className="text-amber-400 font-bold">
              {nextScheduledDate}
            </span>
          </>
        )}
      </p>
    </div>

    <div className="flex items-center gap-3 relative z-10">
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
          <CalendarDays size={13} />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  </div>
);


const RoomCard = ({ room, onEdit, onNavigate }) => {
  const isActive = room.status !== "archived";
  const studentCount = room.students?.length ?? 0;

  return (
    <div
      onClick={() => onNavigate(room._id)}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 relative group"
    >
      <div className="flex items-center gap-x-2 justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold"
          style={{ background: "#5bc0be1a", color: "#5bc0be" }}
        >
          {"</>"}
        </div>

        <div className="tools flex items-center gap-x-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive ? "ACTIVE" : (room.status ?? "").toUpperCase()}
          </span>

          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
            className=" rounded-full p-1.5 group transition-opacity hover:bg-gray-50 z-10 "
            title="Edit classroom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--electric-dark)"
              strokeWidth="2.5"
            >
              <path d="M17 3L21 7L7 21H3V17L17 3Z" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <p className="font-bold text-[14px] text-gray-700 leading-snug line-clamp-2">
          {room.name}
        </p>
        {room.subject && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
            {room.subject}
          </p>
        )}
      </div>

      <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Users size={10} /> {studentCount} students
        </p>
        {room.accessCode && (
          <p className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
            {room.accessCode}
          </p>
        )}
      </div>

      <button
        className="w-full text-[13px] font-bold py-2 rounded-xl text-white mt-auto transition-opacity hover:opacity-90"
        style={{ background: "#5bc0be" }}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(room._id);
        }}
      >
        Open Classroom
      </button>
    </div>
  );
};


const QuickActionsPanel = ({ onCreateRoom, rooms }) => (
  <div
    className="rounded-2xl p-5 flex flex-col gap-3"
    style={{ background: "linear-gradient(135deg,#6c63ff 0%,#7c4dff 100%)" }}
  >
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <CirclePlus size={15} color="white" />
      </div>
      <p className="text-white font-bold text-[14px]">Quick Actions</p>
    </div>
    <button
      onClick={onCreateRoom}
      className="w-full bg-white font-bold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
      style={{ color: "#6c63ff" }}
    >
      <CirclePlus size={14} /> New Classroom
    </button>
    <p className="text-white/60 text-[11px] text-center">
      {rooms.length} classroom{rooms.length !== 1 ? "s" : ""} active
    </p>
  </div>
);


const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCreateModal, openEditModal } = useClassroom();
  const [createRoom, setCreateRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [classroomRes, courseRes, assignmentRes] = await Promise.allSettled(
        [
          classroomService.getMyClassrooms(),
          courseService.getMyCourses(),
          assignmentService.getAssignments(),
        ],
      );

      if (classroomRes.status === "fulfilled") {
        const data = classroomRes.value?.data;
        if (data?.teaching) setRooms(data.teaching);
        else if (data?.all)
          setRooms(
            data.all.filter(
              (r) => r.instructor?._id === user?.id || r.role === "instructor",
            ),
          );
        else if (Array.isArray(data)) setRooms(data);
      }
      if (courseRes.status === "fulfilled")
        setCourses(courseRes.value?.data || []);
      if (assignmentRes.status === "fulfilled")
        setAssignments(assignmentRes.value?.data || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }


  const todaysClasses = rooms.filter((room) => {
    if (room.nextClassDate) {
      const classDate = new Date(room.nextClassDate);
      return classDate.toDateString() === new Date().toDateString();
    }
    if (room.schedule && Array.isArray(room.schedule)) {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      return room.schedule.some((s) => s.day === today);
    }
    return false;
  }).length;

  const todos = assignments.filter((a) => {
    if (a.isDraft) return false;
    const needsAction =
      !a.status || a.status === "pending" || a.status === "not_started";
    const dueDate = a.dueDate ? new Date(a.dueDate) : null;
    const isApproaching = dueDate && dueDate > new Date();
    return needsAction && (!dueDate || isApproaching);
  }).length;


  const now = new Date();


  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);


  const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);
  endOfWeek.setHours(23, 59, 59, 999);


  const upcomingExam = assignments
    .filter(
      (a) => !a.isDraft && a.dueDate && new Date(a.dueDate) >= startOfToday,
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0];


  const nextScheduledDate = upcomingExam?.dueDate
    ? new Date(upcomingExam.dueDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;


  const getDayContext = () => {
    const h = now.getHours();
    if (h < 12) return "today";
    if (h < 17) return "this afternoon";
    return "this evening";
  };


  const totalStudents = rooms.reduce(
    (acc, r) => acc + (r.students?.length || 0),
    0,
  );
  const activeRooms = rooms.filter((r) => r.status !== "archived").length;


  const dueSoon = assignments.filter((a) => {
    if (a.isDraft || !a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    return dueDate >= startOfToday && dueDate <= endOfWeek;
  }).length;

  const handleClassroomChange = async () => {
    await fetchAll();
  };

  function handleCreateRoom() {
    setEditingRoom(null);
    setCreateRoom(true);
  }
  function handleEditRoom(room) {
    setEditingRoom(room);
    setCreateRoom(true);
  }

  async function handleSaveRoom(roomData) {
    try {
      if (editingRoom) {
        await classroomService.updateClassroom(editingRoom._id, roomData);
        toast.success("Classroom updated!");
      } else {
        const res = await classroomService.createClassroom(roomData);
        toast.success(`Classroom "${roomData.name}" created!`);
        toast.info(`Access Code: ${res.data.accessCode}`, {
          duration: 5000,
          action: {
            label: "Copy",
            onClick: () => navigator.clipboard.writeText(res.data.accessCode),
          },
        });
      }
      await fetchAll();
    } catch (err) {
      toast.error(err?.error || "Failed to save classroom");
    } finally {
      setCreateRoom(false);
      setEditingRoom(null);
    }
  }


  const stats = [
    {
      icon: GraduationCap,
      label: "Total Students",
      value: totalStudents,
      sub: "across all classrooms",
      accent: "#25c7b1",
      loading,
    },
    {
      icon: School,
      label: "Active Classrooms",
      value: activeRooms,
      sub: `${rooms.length} total`,
      accent: "#3b82f6",
      loading,
    },
    {
      icon: ClipboardList,
      label: "Due This Week",
      value: dueSoon,
      sub: "assignments upcoming",
      accent: "#f59e0b",
      loading,
    },
    {
      icon: BookOpen,
      label: "Curricula",
      value: courses.length,
      sub: `${courses.filter((c) => c.status === "published").length} published`,
      accent: "#8b5cf6",
      loading,
    },
  ];

  return (
    <ClassroomProvider onClassroomChange={handleClassroomChange}>
      
      <section
        className="w-[90wv] min-h-screen font-sans"
        style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}
      >
        <div className="w-[90wv] mx-auto px-6 pt-6 pb-10 flex flex-col gap-6">
         
          <HeroBanner
            firstName={user?.firstName ?? "Instructor"}
            todaysClasses={todaysClasses}
            todos={todos}
            nextScheduledDate={nextScheduledDate}
            upcomingExam={upcomingExam}
            getDayContext={getDayContext}
          />

          
          <div className="flex gap-4">
            {stats.map((s, i) => (
              <MiniStatCard key={i} {...s} />
            ))}
          </div>

      
          <div className="grid grid-cols-3 gap-5">
            
            <div className="col-span-2 flex flex-col gap-5">
              
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-(--dark-navy) text-2xl">
                  Your Classrooms
                  <span className="ml-2 text-sm font-semibold text-gray-400">
                    ({rooms.length})
                  </span>
                </h2>
                <button
                  onClick={() => navigate("/instructor/all-classes")}
                  className="flex items-center gap-1 text-[12px] font-semibold text-cyan-500 hover:underline cursor-pointer"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

             
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-40"
                    />
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                  <School size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold mb-4">
                    No classrooms yet
                  </p>
                  <button
                    onClick={handleCreateRoom}
                    className="bg-cyan-50 text-cyan-600 px-5 py-2.5 rounded-full font-bold text-sm inline-flex items-center gap-2 hover:bg-cyan-100 transition-colors"
                  >
                    <CirclePlus size={16} /> Create your first classroom
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {rooms.slice(0, 6).map((room) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      onEdit={(r) => {
                        openEditModal(r);
                      }}
                      onNavigate={(id) =>
                        navigate(`/instructor/classrooms/${id}`)
                      }
                    />
                  ))}
                </div>
              )}

              
              <BarChartCard assignments={assignments} loading={loading} />

          
              <div className="grid grid-cols-2 gap-5">
                <AssignmentSnapShot
                  assignments={assignments}
                  loading={loading}
                />
                <CurriculumSnapshot courses={courses} loading={loading} />
              </div>
            </div>

       
            <div className="flex flex-col gap-5">
              <QuickActionsPanel
                onCreateRoom={handleCreateRoom}
                rooms={rooms}
              />
              <ActivityFeed
                classrooms={rooms}
                assignments={assignments}
                loading={loading}
              />
            </div>
          </div>
        </div>

        
        {createRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <CreateRoomForm
              onClose={() => {
                setCreateRoom(false);
                setEditingRoom(null);
              }}
              onSaveRoom={handleSaveRoom}
              editingRoom={editingRoom}
              mode="room"
            />
          </div>
        )}
      </section>
    </ClassroomProvider>
  );
};

export default InstructorDashboard;
