
import "./DashboardClassroomCard.css";

import { Users, BookOpen, ClipboardList, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LEVEL_COLORS = {
  beginner:     { bg: "bg-emerald-50",  text: "text-emerald-600" },
  intermediate: { bg: "bg-amber-50",    text: "text-amber-600"   },
  advanced:     { bg: "bg-red-50",      text: "text-red-600"     },
};

const DashboardClassroomCard = ({ room }) => {
  const navigate = useNavigate();
  const level = room.level?.toLowerCase() || "beginner";
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.beginner;

  return (
    <div
      onClick={() => navigate(`/instructor/classrooms/${room._id}`)}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-4"
    >
    
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-(--dark-navy) text-[1rem] truncate">{room.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{room.subject}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${colors.bg} ${colors.text}`}>
          {room.level}
        </span>
      </div>

  
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Users size={13} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{room.students?.length || 0}</span> students
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen size={13} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{room.courses?.length || 0}</span> courses
        </span>
        <span className="flex items-center gap-1.5">
          <ClipboardList size={13} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{room.assignmentCount || 0}</span> assignments
        </span>
      </div>

   
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Code: <span className="font-mono font-bold text-gray-600 tracking-wider">{room.accessCode}</span>
        </span>
        <ArrowRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </div>
  );
};

export default DashboardClassroomCard;