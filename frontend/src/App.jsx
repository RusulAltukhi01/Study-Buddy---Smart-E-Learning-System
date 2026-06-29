import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer/Footer";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AiToolsPage from "./pages/AiToolsPage/AiToolsPage";
import Login from "./components/Login/Login";
import Join from "./components/Join/Join";
import Signup from "./components/Signup/Signup";
import { AuthProvider } from "./contexts/AuthContext";
import Loader from "./UI/Loader/Loader";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import NotFound from "./components/NotFound/NotFound";
import StudentDashboard from "./components/StudentDashboard/StudentDashboard";
import InstructorDashboard from "./components/InstructorDashboard/InstructorDashboard";
import InstructorLayout from "./components/InstructorLayout/InstructorLayout";
import { useEffect, useState } from "react";
import InstructorStudents from "./components/InstructorStudents/InstructorStudents";
import ClassroomsPage from "./pages/ClassroomsPage/ClassroomsPage";
import ClassroomDetails from "./pages/ClassroomDetails/ClassroomDetails";
import ClassroomPageStudent from "./pages/ClassroomPageStudent/ClassroomPageStudent";
import Breadcrumb from "./components/Breadcrumb/Breadcrumb";
import StudentDetailsPage from "./components/StudentDetailsPage/StudentDetailsPage";
import StudentLayout from "./components/StudentLayout/StudentLayout";
import InstructorPage from "./pages/InstructorPage/InstructorPage";
import ClassroomPageInstructor from "./pages/ClassroomPageInstructor/ClassroomPageInstructor";
import AllAssignments from "./components/AllAssignments/AllAssignments";
import AllClasses from "./components/AllClasses/AllClasses";
import Curriculums from "./pages/Curriculums/Curriculums";
import QuizPage from "./pages/QuizPage/QuizPage";
import InstructorQuizzez from "./pages/InstructorQuizzez/InstructorQuizzez";
import StudentFeedPage from "./pages/StudentFeedPage/StudentFeedPage";
import StudentAssignmentsPage from "./components/StudentAssignmentPage/StudentAssignmentPage";
import StudentQuizzesPage from "./pages/StudentQuizzesPage/StudentQuizzesPage";
import StudentCoursesPage from "./components/StudentCoursesPage/StudentCoursesPage";
import VerifyOTP from "./pages/VerifyOtp/VerifyOtp";
import InstructorProfilePage from "./pages/InstructorProfilePage/InstructorProfilePage";
import StudentProfilePage from "./pages/StudentProfilePage/StudentProfilePage";
import ReviewSubmissionsPage from "./pages/ReviewSubmissionsPage/ReviewSubmissionsPage";
import AssignmentGrade from "./components/AssignmentGrade/AssignmentGrade";
import MyGrades from "./components/MyGrades/MyGrades";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

const AppContent = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop();

  return (
    <div className="app-container min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/summary" element={<AiToolsPage tool="summary" />} />
        <Route path="/quiz" element={<AiToolsPage tool="quiz" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/join" element={<Join />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["student", "instructor", "admin"]} />
          }
        >
          {/* <Route path="/classrooms" element={<ClassroomsPage />} />
          <Route
            path="/classrooms/:classroomId"
            element={<ClassroomDetails />}
          /> */}
          <Route
            path="/classrooms/:classroomId/:studentId"
            element={<StudentDetailsPage />}
          />
          {/* <Route path="/classrooms/:id/join" element={<Join />} /> */}
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route
            path="/student/*"
            element={
              <StudentLayout currentTab={currentTab} setCurrentTab={() => {}} />
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route
              path="classrooms/:classroomId"
              element={<ClassroomPageStudent />}
            />
            <Route
              path="instructor/:instructorId"
              element={<InstructorPage />}
            />
            <Route path="quizzes" element={<StudentQuizzesPage />} />

            <Route path="courses" element={<StudentCoursesPage />} />
            <Route path="quizzes/:quizId" element={<QuizPage />} />
            <Route
              path="classrooms/:classroomId/feed"
              element={<StudentFeedPage />}
            />
            <Route path="assignments" element={<StudentAssignmentsPage />} />
            <Route
              path="assignments/:assignmentId/grade"
              element={<AssignmentGrade />}
            />
            <Route
              path="classrooms/:classroomId/grades"
              element={<MyGrades />}
            />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>
        </Route>

        {/* Instructor routes */}
        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route
            path="/instructor/*"
            element={
              <InstructorLayout
                currentTab={currentTab}
                setCurrentTab={() => {}}
              />
            }
          >
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="all-students" element={<InstructorStudents />} />
            <Route
              path="classrooms/:classroomId/assignments"
              element={<AllAssignments />}
            />
            <Route
              path="assignments/:assignmentId/submissions"
              element={<ReviewSubmissionsPage />}
            />

            <Route path="courses" element={<Curriculums />} />
            <Route path="assignments" element={<Curriculums />} />
            <Route path="profile" element={<InstructorProfilePage />} />
            <Route path="all-classes" element={<AllClasses />} />
            <Route path="quizzez" element={<InstructorQuizzez />} />
            <Route
              path="classrooms/:classroomId"
              element={<ClassroomPageInstructor />}
            />
          </Route>
        </Route>

        {/* Shared routes */}
        <Route
          element={<ProtectedRoute allowedRoles={["student", "instructor"]} />}
        >
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
          <Route path="/settings" element={<>Settings Page</>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        {/* <div className="w-full">
          <Breadcrumb />
        </div> */}
        <AppContent />
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;