import { Key } from "lucide-react";
import "./JoinClassRoomCard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import classroomService from "../../services/classroomService";

const JoinClassRoomCard = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    try {
      const response = await classroomService.joinClassroom(code);
      if (response.status === 200) {
        toast.success("Welcome !");
        navigate(`/classroom/${response.data.data._id}`);
      }
    } catch (err) {
      toast.error("Failed to join classroom", err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5  flex flex-col gap-3">
      {/* Decorative teal blob — matches the subtle shape in the image */}
      <div className="join-card-blob" />
{/* 
      <div>
        <h2 className="font-bold text-gray-800 text-base leading-tight">
          Join New Classroom
        </h2>
        <p className="text-gray-400 text-xs mt-1 leading-snug">
          Enter your invitation code to access the course content.
        </p>
      </div> */}

      {/* Input */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--electric)] transition-all bg-white">
        <Key size={15} color="var(--electric-dark)" className="shrink-0" />
        <input
          type="text"
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 outline-none bg-transparent uppercase tracking-widest"
          placeholder="Invite Code (E.G. AB123)"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

    
      <button
        onClick={handleJoin}
        className="w-full bg-[var(--electric)] hover:bg-[var(--electric-dark)] transition-colors text-white font-semibold py-2.5 rounded-xl text-sm cursor-pointer"
      >
        Join Classroom
      </button>
    </div>
  );
};

export default JoinClassRoomCard;