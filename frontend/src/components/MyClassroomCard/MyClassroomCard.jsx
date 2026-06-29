import { Bell, Calendar, LogIn, User } from "lucide-react";
import "./MyClassroomCard.css";


const GRADIENTS = [
  "linear-gradient(135deg, #4f8ef7 0%, #3ecfb2 100%)",
  "linear-gradient(135deg, #f25c78 0%, #f5a623 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #4f8ef7 100%)",
  "linear-gradient(135deg, #3ecfb2 0%, #4f8ef7 100%)",
  "linear-gradient(135deg, #f5a623 0%, #f25c78 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)",
];

const getGradient = (id = "") => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const MyClassroomCard = ({ classId, classroomName, classInstructor, onClick }) => {
  const gradient = getGradient(classId);
  const initials = getInitials(classroomName);
  const instructorName = classInstructor
    ? `${classInstructor.firstName ?? ""} ${classInstructor.lastName ?? ""}`.trim()
    : "Unknown Instructor";

  return (
    <div className="my-classroom-card" onClick={onClick}>
      
      <div
        className="my-classroom-cover"
        style={{ "--cover-gradient": gradient }}
      >
        <div className="my-classroom-avatar">{initials || "?"}</div>
      </div>

   
      <div className="my-classroom-card-content">
        
        <div className="my-classroom-titles">
          <h1>{classroomName || "Unnamed Classroom"}</h1>
          <span className="my-classroom-instructor">
            <User size={13} />
            {instructorName}
          </span>
        </div>

        <div className="my-classroom-info">
          <div className="info-pill deadline">
            <Calendar size={13} />
            <span className="label">Next deadline:</span>
            Nov 02 — Calculus Quiz
          </div>
          <div className="info-pill announcement">
            <Bell size={13} />
            3 unread announcements
          </div>
        </div>

      
        <div className="my-classroom-footer">
          <span className="last-access">Last access: Today</span>
          <button
            className="enter-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Enter <LogIn size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyClassroomCard;