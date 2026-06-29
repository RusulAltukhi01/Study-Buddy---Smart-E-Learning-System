import "./DashboardHeader.css";
import { useAuth } from "./../../contexts/AuthContext";
import { Bell } from "lucide-react";
import JoinClassRoomCard from "../JoinClassRoomCard/JoinClassRoomCard";

const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-header p-5  flex justify-between items-center min-h-[20vh] mb-10">
      {/* <img src={user?.profilePicture} alt="user avatar" className="w-[30px] h-[30px]" /> */}

      <div className="dash-header-titles flex flex-col gap-y-5">
        <h1 className="text-[3rem]">
          Hello, <span className="user-name">{`${user?.firstName}!`}</span>
        </h1>
        <h3 className="header-reminder">
          You have <span className="day">today</span>{" "}
          <span className="#classes">1 class</span> and{" "}
          <span className="to-do-length">3 to-dos</span>, Upcoming exam{" "}
          <span className="next-sched-date">march 23 - 2026</span>
        </h3>
      </div>

      {
        user.role === "student" && (
          <JoinClassRoomCard />
        )
      }
      
    </div>
  );
};

export default DashboardHeader;
