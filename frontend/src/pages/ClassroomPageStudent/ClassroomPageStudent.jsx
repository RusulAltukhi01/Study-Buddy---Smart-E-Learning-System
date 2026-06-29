import { useEffect, useState } from "react";
import "./ClassroomPageStudent.css";
import classroomService from "../../services/classroomService";
import { NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Award,
  BellDot,
  BookCopy,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleQuestionMark,
  Clock,
  File,
  FileQuestion,
  Form,
  Lock,
  Plus,
  ScrollText,
  Sparkle,
  Users,
  BookOpen,
} from "lucide-react";
import MyProgress from "../../components/MyProgress/MyProgress";
import LinearProgressbar from "../../components/LinearProgressbar/LinearProgressbar";
import PinnedResources from "../../components/PinnedResources/PinnedResources";
import UpcomingTasks from "../../components/UpcomingTasks/UpcomingTasks";
import RecentAnnouncements from "../../components/RecentAnnouncements/RecentAnnouncements";
import quizService from "../../services/quizService";
import StudentQuizCard from "../../components/StudentQuizCard/StudentQuizCard";
import { getImageUrl } from "../../utils/getImageUrl";
import userService from "../../services/userService";
import ClassLeaderboard from "../../components/ClassLeaderboard/ClassLeaderboard";

const ClassroomPage = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [classroom, setClassroom] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const classroomDataResponse = await classroomService.getClassroomById(classroomId);
        const [studentRes, progressRes] = await Promise.all([
          userService.getCurrentStudent(),
          userService.getStudentProgress(classroomId),
        ]);
        setClassroom(classroomDataResponse.data);
        setCurrentStudent(studentRes.data);
        setStudentProgress(progressRes.data);
      } catch (err) {
        console.error("Error fetching classroom:", err);
      }
    };
    if (classroomId) fetchClassroom();
  }, [classroomId]);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await quizService.getClassroomQuizzes(classroomId);
        setQuizzes(res.data || []);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
        setQuizzes([]);
      }
    }
    if (classroomId) fetchQuizzes();
  }, [classroomId]);

  return (
    <div
      className="w-full min-h-screen flex flex-col gap-5 sm:gap-6 p-4 sm:p-6 lg:p-7 overflow-x-hidden box-border"
      style={{ backgroundColor: "#f3f4f6" }}
    >
    
      <header
        className="relative overflow-hidden w-full flex flex-col sm:flex-row justify-between items-start sm:items-end rounded-[24px] px-5 py-7 sm:px-8 sm:py-10 min-h-[180px] sm:min-h-[220px] border border-white/5 gap-4 sm:gap-6 box-border"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 80%, #059669 100%)" }}
      >
      
        <div
          className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #34d399 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute left-1/2 bottom-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
            transform: "translate(-50%, 40%)",
          }}
        />

      
        <div className="relative z-10 flex flex-col gap-3 min-w-0 flex-1">
          <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-300 bg-emerald-300/10 px-2 py-0.5 rounded-full w-fit">
            Classroom
          </span>
          <h1 className="text-[clamp(1.4rem,4vw,2.8rem)] font-black leading-[1.05] tracking-tight text-white break-words">
            {classroom?.name}
          </h1>

          <div className="flex items-center gap-3 min-w-0">
            {getImageUrl(classroom?.instructor?.profilePicture) ? (
              <img
                src={getImageUrl(classroom?.instructor?.profilePicture)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-emerald-300/40 flex-shrink-0"
                alt={`${classroom?.instructor?.firstName} ${classroom?.instructor?.lastName}`}
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-300/20 border-2 border-emerald-300/30 flex items-center justify-center text-[13px] font-bold tracking-widest uppercase text-emerald-200 flex-shrink-0">
                {classroom?.instructor?.firstName?.[0]}
                {classroom?.instructor?.lastName?.[0]}
              </div>
            )}
            <NavLink to={`/student/instructor/${classroom?.instructor?.id}`} className="min-w-0">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-[1.5px] font-semibold text-emerald-300/70">
                  Instructor
                </span>
                <span className="text-[13px] sm:text-[14px] font-semibold text-emerald-100 mt-0.5 hover:text-white transition-colors truncate">
                  {classroom?.instructor?.firstName} {classroom?.instructor?.lastName}
                </span>
              </div>
            </NavLink>
          </div>
        </div>

   
        <div className="relative z-10 flex items-center gap-3 flex-shrink-0 self-start sm:self-end">
          {classroom?.students && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <Users size={14} className="text-emerald-300 flex-shrink-0" />
              <span className="text-white text-[12px] font-semibold whitespace-nowrap">
                {classroom.students.length} students
              </span>
            </div>
          )}
          <button
            className="flex items-center justify-center rounded-xl p-2.5 bg-white/10 hover:bg-white/20 transition-all flex-shrink-0"
            aria-label="Notifications"
          >
            <BellDot size={20} className="text-emerald-200" />
          </button>
        </div>
      </header>

    
      <section className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] gap-5 lg:gap-6 items-start">

        
        <main className="flex flex-col gap-5 min-w-0">

          <MyProgress
            student={currentStudent}
            progress={studentProgress}
            classroom={classroom}
          />

          <RecentAnnouncements
            classroomId={classroomId}
            highlightData={location.state?.highlight}
          />

        
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-4 min-w-0">
            <header className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-[10px] bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <File size={15} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-800 leading-tight">Latest Quizzes</h2>
                  {quizzes?.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{quizzes.length} total</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate("/student/quizzes")}
                className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer bg-transparent border-none flex-shrink-0 whitespace-nowrap"
              >
                Show all <ChevronRight size={14} />
              </button>
            </header>

            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No quizzes yet.</p>
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <StudentQuizCard key={quiz._id} quiz={quiz} />
                ))
              )}
            </ul>
          </div>

          <UpcomingTasks />
        </main>

       
        <aside className="flex flex-col gap-5 min-w-0 w-full">
          <StudyHub />
          <PinnedResources classroomId={classroomId} />
          <ClassLeaderboard />
        </aside>
      </section>
    </div>
  );
};

export function StudyHub() {
  return (
    <div
      className="rounded-2xl border border-emerald-100 p-5 sm:p-6 flex flex-col gap-4 min-w-0 w-full box-border"
      style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" }}
    >
   
      <header className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[10px] bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Brain size={17} className="text-emerald-700" />
        </div>
        <h2 className="text-[15px] font-bold text-emerald-900">AI Study Hub</h2>
      </header>

     
      <div className="flex flex-col gap-2">
        <button className="flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 text-[13px] font-semibold transition-all bg-white/70 hover:bg-white text-emerald-800 border border-emerald-100 hover:border-emerald-200 min-w-0">
          <BookCopy size={17} className="flex-shrink-0 text-emerald-600" />
          <span className="truncate">Summarize Last Lesson</span>
        </button>
        <button className="flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 text-[13px] font-semibold transition-all bg-white/70 hover:bg-white text-emerald-800 border border-emerald-100 hover:border-emerald-200 min-w-0">
          <Form size={17} className="flex-shrink-0 text-emerald-600" />
          <span className="truncate">Generate Practice Quiz</span>
        </button>
        <button className="flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 text-[13px] font-semibold transition-all bg-white/70 hover:bg-white text-emerald-800 border border-emerald-100 hover:border-emerald-200 min-w-0">
          <CircleQuestionMark size={17} className="flex-shrink-0 text-emerald-600" />
          <span className="truncate">Ask a Question</span>
        </button>
      </div>

      <div className="h-px bg-emerald-200/60" />
      <p className="text-[11px] text-emerald-500/70 text-center tracking-wide">Powered by AI</p>
    </div>
  );
}

export default ClassroomPage;