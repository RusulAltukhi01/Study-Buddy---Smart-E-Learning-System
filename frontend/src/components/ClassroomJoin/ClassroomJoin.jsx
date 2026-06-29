import { Share2, Users, LogIn } from "lucide-react";
import "./ClassroomJoin.css";
import { useState } from "react";
import { toast } from "sonner";
import PropTypes from "prop-types";


const ClassroomJoin = ({
  classroomId,
  classroomTitle,
  classroomCode,
  classroomSubject,
  studentCount = 0,
  userRole,
  onClick
}) => {
  const [copied, setCopied] = useState(false);


  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(classroomCode);
      setCopied(true);
      toast.success("Code copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy code");
    }
  }

  // const handleJoin = () => {
  //   if (classroomId) {
  //     navigate(`/classrooms/${classroomId}`);
  //   } else {
  //     toast.error("Classroom ID not found");
  //   }
  // };



  return (
    <div className="classroom-join w-[400px] min-h-[500px]  rounded-3xl flex flex-col justify-between items-center border border-gray-200 relative">
      <div className="classroom-image rounded-t-2xl w-full h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>

      <div className="classroomCard-titles flex flex-col w-full p-4">
        <h1 className="block w-full font-bold text-gray-700 text-[1.7rem]">
          {classroomTitle || "Untitled Classroom"}
        </h1>

        {classroomSubject && (
          <span className=" mx-2 font-semibold tracking-wider text-[1.2rem] text-(--electric-dark)">{classroomSubject}</span>
        )}
      </div>

      <div className="classroom-card-info flex flex-col w-full h-full flex-1 p-2 justify-between items-center">
        <div className="info-set flex bg-gray-100 py-4 px-6 w-full  gap-x-4 font-bold text-gray-400 rounded-lg">
          <span className="flex flex-1 items-center gap-x-2">
            <Users />
            {studentCount} {studentCount === 1 ? "Student" : "Students"}
          </span>

          <button
            onClick={onClick}
            className="p-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {userRole === "instructor" ? "Go to Classroom" : "Join Classroom"}
          </button>
        </div>

        <div className="copy-code w-full flex flex-col gap-y-2 justify-center items-center relative">
          <span className="uppercase text-gray-400 tracking-[2px] font-[700] font-mono text-[1.15rem]">
            join code
          </span>

          <div
            title="copy code"
            className="code flex justify-center items-center gap-x-2 text-[var(--dark-navy)] font-bold"
          >
            <span
              onClick={handleCopyCode}
              className="cursor-pointer hover:bg-gray-100 w-fit p-4 rounded-lg transition-colors"
            >
              {classroomCode || "No Code"}
            </span>

            <span
              title="share code"
              className="bg-[var(--electric-pastel)] py-3 px-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors"
              onClick={handleCopyCode}
            >
              <Share2 color="var(--electric)" />
            </span>
          </div>

          {copied && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap animate-bounce">
              ✓ Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomJoin;

ClassroomJoin.propTypes = {
  classroomTitle: PropTypes.string,
  classroomDesc: PropTypes.string,
  classroomCode: PropTypes.string,
  classroomLevel: PropTypes.string,
  classroomSubject: PropTypes.string,
  classroomId: PropTypes.string.isRequired,
  userRole: PropTypes.oneOf(["student", "instructor", "admin"]),
  onJoin: PropTypes.func,
};

ClassroomJoin.defaultProps = {
  classroomTitle: "Untitled Classroom",
  classroomDesc: "",
  classroomCode: "No Code",
  classroomLevel: "",
  classroomSubject: "",
  studentCount: 0,
  userRole: "student",
  onJoin: null,
};

