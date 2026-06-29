import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classroomService from "../../services/classroomService";
import { toast } from "sonner";
// import { useAuth } from "../../contexts/AuthContext";
import Loader from "../../UI/Loader/Loader";
import { Clipboard, Copy, Plus, Settings, Users } from "lucide-react";
import NavigatedTabs from "../../components/NavigatedTabs/NavigatedTabs";
import InstructorDashboard from "./../../components/InstructorDashboard/InstructorDashboard";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Students from "../../components/Students/Students";
import AddedAssignments from "../../components/AddedAssignments/AddedAssignments";

const ClassroomDetails = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigatedTabsNames = ["Feed", "students", "Assignments"];

  const [activeTab, setActiveTab] = useState("students");

  const handleActiveTab = (tabName) => {
    setActiveTab(tabName);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "feed":
        return <DashboardContent />;
      case "students":
        return <Students classroomId={classroomId} />;
      case "assignments":
        return <AddedAssignments />;
      default:
        return <DashboardContent />;
    }
  };

  const StudentsContent = () => (
    <div className="students-content">
      <h2 className="text-2xl font-bold">Students List</h2>
      <p>Your students content here...</p>
    </div>
  );

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      console.log("Fetching classroom with ID:", classroomId);
      const response = await classroomService.getClassroomById(classroomId);
      console.log("Classroom fetched successfully:", response);
      setClassroom(response.data);
    } catch (error) {
      console.error("Failed to load classroom:", error);
      toast.error(error.error || "Failed to load classroom");
      navigate("/classrooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(classroom.accessCode);
      toast.success("Join code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy code");
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="w-full text-center text-[32px] font-bold">
        Classroom not found
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen flex flex-col  items-center p-10 ">
      <Breadcrumb dynamicData={{ classroomName: classroom.name }} />
      <header className="w-full flex justify-between items-center p-8 bg-gray-100">
        <div className="header-titles flex flex-col">
          <h1 className="text-[36px] font-bold">{classroom.name}</h1>
          <h3 className="font-semibold text-gray-400">
            {classroom.description || "No Description is added."}
          </h3>

          <div className="header-info flex justify-between items-center gap-x-4">
            <div className="join-code p-2 my-3 flex gap-x-2 py-3 px-6 rounded-lg bg-(--royal-blue-pastel) font-semibold tracking-wider border-1 border-blue-200 text-blue-500">
              <span className=" uppercase font-bold">Join Code :</span>
              <span>{classroom.accessCode}</span>
              <span
                className="cursor-pointer"
                onClick={handleCopyCode}
                title="Copy code"
              >
                <Copy />
              </span>
            </div>

            <div className="students-count">
              <span className="flex gap-x-2 font-semibold text-gray-500">
                <Users /> {classroom.studentCount} students enrolled
              </span>
            </div>
          </div>
        </div>

        <div className="header-btns flex justify-between gap-x-6 items-center font-semibold text-gray-900">
          <button className="flex items-center gap-x-2 bg-blue-100 px-5 py-4 rounded-lg cursor-pointer">
            <Settings /> Manage
          </button>
          <button className="flex items-center gap-x-2 bg-(--electric) text-white px-5 py-4 rounded-lg border-1 border-(--electric) cursor-pointer hover:bg-(--electric-dark)">
            <Plus /> New Module
          </button>
        </div>
      </header>

      <section className="navigated-tabs-section w-full my-8">
        <NavigatedTabs
          navigatedTabsNames={navigatedTabsNames}
          activeTab={activeTab}
          onTabClick={handleActiveTab}
        />
        <div className="tab-content-container p-4">{renderTabContent()}</div>
      </section>
    </main>
  );
};

export default ClassroomDetails;
