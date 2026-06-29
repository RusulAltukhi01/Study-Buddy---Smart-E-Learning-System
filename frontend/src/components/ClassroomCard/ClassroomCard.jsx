import { Users, BookOpen, Lock, Globe } from "lucide-react";

const ClassroomCard = ({ classroom, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 bg-white"
    >
      <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
        {classroom.coverImage && (
          <img 
            src={classroom.coverImage} 
            alt={classroom.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 right-2">
          {classroom.isPrivate ? (
            <Lock size={16} className="text-white bg-black/50 p-1 rounded-full" />
          ) : (
            <Globe size={16} className="text-white bg-black/50 p-1 rounded-full" />
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 truncate">{classroom.name}</h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
          {classroom.description || "No description provided"}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{classroom.students?.length || 0} students</span>
          </div>
          
          <div className="flex items-center gap-1">
            <BookOpen size={16} />
            <span className="truncate max-w-[100px]">
              {classroom.subject || "No subject"}
            </span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded">
          Code: {classroom.accessCode}
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Created: {new Date(classroom.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ClassroomCard;