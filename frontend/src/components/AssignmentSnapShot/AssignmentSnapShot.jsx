import "./AssignmentSnapShot.css";
import { Calendar, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";


function getAssignmentDateBadge(dateStr) {
  if (!dateStr) {
    return { 
      text: "NO DUE DATE", 
      styles: "text-gray-400 bg-gray-50 border border-gray-100" 
    };
  }

  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diff = due.getTime() - now.getTime();
  const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));


  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays >= 7) {
      const weeks = Math.floor(absDays / 7);
      return { 
        text: `${weeks} ${weeks === 1 ? "WEEK" : "WEEKS"} OVERDUE`, 
        styles: "text-red-400 bg-red-950/40 border border-red-900/50" 
      };
    }
    return { 
      text: `${absDays}D OVERDUE`, 
      styles: "text-red-400 bg-red-950/40 border border-red-900/50" 
    };
  }


  if (diffDays === 0) {
    return { 
      text: "DUE TODAY", 
      styles: "text-orange-500 bg-orange-50 border border-orange-100" 
    };
  }

 
  if (diffDays === 1) {
    return { 
      text: "DUE TOMORROW", 
      styles: "text-amber-500 bg-amber-50 border border-amber-100" 
    };
  }


  if (diffDays <= 7) {
    return { 
      text: `DUE IN ${diffDays}D`, 
      styles: "text-yellow-600 bg-yellow-50 border border-yellow-100" 
    };
  }


  const weeks = Math.floor(diffDays / 7);
  return { 
    text: `DUE IN ${weeks} ${weeks === 1 ? "WEEK" : "WEEKS"}`, 
    styles: "text-blue-500 bg-blue-50 border border-blue-100" 
  };
}

const AssignmentSnapShot = ({ assignments = [], loading }) => {
  const navigate = useNavigate();

  const urgent = assignments
    .filter((a) => !a.isDraft)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <h2 className="font-bold text-(--dark-navy) text-lg">Upcoming Assignments</h2>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 rounded w-40" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
              <div className="w-16 h-5 bg-gray-100 rounded-full" />
            </div>
          ))
        ) : urgent.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No upcoming assignments
          </div>
        ) : (
          urgent.map((a) => {
            const isOverdue = a.dueDate && new Date(a.dueDate) < new Date();
            const badge = getAssignmentDateBadge(a.dueDate);
            const initials = a.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            
            return (
              <div key={a._id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-(--electric-pastel) flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-(--royal-blue)">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 truncate">{a.classroom?.name || "No classroom"}</p>
                </div>
                
                
                <span className={`text-[10px] font-extrabold flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md tracking-wider ${badge.styles}`}>
                  {isOverdue && <AlertCircle size={11} />}
                  {badge.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssignmentSnapShot;