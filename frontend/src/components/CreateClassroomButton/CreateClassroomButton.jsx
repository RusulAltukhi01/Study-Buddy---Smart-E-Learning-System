import { CirclePlus } from "lucide-react";

const CreateClassroomButton = ({ onClick, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-(--electric-pastel) text-(--dark-navy) hover:text-(--electric) border border-cyan-100",
    secondary: "bg-emerald-500 hover:bg-emerald-600 text-white",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    dark: "bg-gray-800 hover:bg-gray-900 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`flex justify-center items-center gap-x-2 py-3 px-5 rounded-full font-bold cursor-pointer transition-colors text-sm ${variants[variant]} ${className}`}
    >
      <CirclePlus size={18} />
      Create New Classroom
    </button>
  );
};

export default CreateClassroomButton;