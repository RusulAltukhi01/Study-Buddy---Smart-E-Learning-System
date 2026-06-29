import { useState } from "react";
import Sidebar, { SidebarItems } from "../Sidebar/Sidebar";
import "./StudentLayout.css";
import { BookOpenCheck, BookText, Bot, GraduationCap, LayoutDashboard, School, ShieldUser, UserRoundPen } from "lucide-react";
import { Outlet } from "react-router-dom";

const StudentLayout = ({ currentTab, setCurrentTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="student-dashboard flex w-full min-h-screen text-(--warm-white) ">
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
          tabName="classrooms"
          text="Classrooms"
          icon={<School />}
        />
        <SidebarItems tabName="assignments" text="Assigments" icon={<ShieldUser />} />
        <SidebarItems tabName="courses" text="Courses" icon={<BookText />} />
        <SidebarItems tabName="quizzes" text="Quizzes" icon={<BookOpenCheck />} />
  
        <SidebarItems
          tabName="profile"
          text="Profile"
          icon={<UserRoundPen />}
        />
      </Sidebar>

      <section className="student-layout w-full min-h-screen ">
        <Outlet />
      </section>
    </div>
  );
};

export default StudentLayout;
