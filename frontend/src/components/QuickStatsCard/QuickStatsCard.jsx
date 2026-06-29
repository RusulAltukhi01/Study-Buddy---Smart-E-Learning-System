import { BookOpenCheck } from "lucide-react";
import "./QuickStatsCard.css";

const QuickStatsCard = ({ icon: Icon, title, value, color,  subtitle }) => {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-2 border border-gray-100 shadow-sm">
      
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={20} color={color} />
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ color, backgroundColor: `${color}18` }}
        >
          {subtitle}
        </span>
      </div>
 
 
      <p className="text-gray-400 text-xs font-medium mt-1">{title}</p>
 
     
      <p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>
    </div>
  );
};
 
export default QuickStatsCard;