import { useState } from "react";
import Sidebar, { SidebarItems } from "../Sidebar/Sidebar";
import {
  LayoutDashboard,
  GraduationCap,
  ShieldUser,
  School,
  BookText,
  BookOpenCheck,
  UserRoundPen,
  NotebookPen,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { ClassroomProvider } from "../../contexts/ClassroomContext";

const InstructorLayout = ({ currentTab, setCurrentTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="instructor-dashboard flex w-full min-h-screen text-(--warm-white)">
      <Sidebar
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      >
        <SidebarItems
          tabName="dashboard"
          text="Dashboard"
          icon={<LayoutDashboard />}
        />
        <SidebarItems
          tabName="all-students"
          text="Students"
          icon={<GraduationCap />}
        />
        {/* <SidebarItems tabName="admins" text="Admins" icon={<ShieldUser />} /> */}
        <SidebarItems tabName="all-classes" text="Classes" icon={<School />} />
        <SidebarItems
          tabName="courses"
          text="Curriculums"
          icon={<BookText />}
        />
        {/* <SidebarItems tabName="all-assignments" text="Assignments" icon={<NotebookPen />} /> */}
        <SidebarItems
          tabName="quizzez"
          text="Quizzes"
          icon={<BookOpenCheck />}
        />
        <SidebarItems
          tabName="profile"
          text="Profile"
          icon={<UserRoundPen />}
        />
      </Sidebar>

      <ClassroomProvider>
        <section className="instructor-layout w-full min-h-screen">
          <Outlet />
        </section>
      </ClassroomProvider>
    </div>
  );
};

export default InstructorLayout;
