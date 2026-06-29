import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Trophy, Medal, Star } from "lucide-react";
import userService from "../../services/userService";
import { getImageUrl } from "../../utils/getImageUrl";
import "./ClassLeaderboard.css"; 

const ClassLeaderboard = () => {
  const { classroomId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentStudentRank, setCurrentStudentRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!classroomId) return;
      
      try {
        setLoading(true);
        
        const studentRes = await userService.getCurrentStudent();
        setCurrentStudent(studentRes.data);
        
        const leaderboardRes = await userService.getClassLeaderboard(classroomId);
        setLeaderboard(leaderboardRes.data);

        const currentStudentId = studentRes.data._id;
        const studentRankData = leaderboardRes.data.find(
          (s) => s.studentId === currentStudentId
        );
        setCurrentStudentRank(studentRankData);
        
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [classroomId]);

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1:
        return <Trophy size={18} className="text-yellow-500 flex-shrink-0" />;
      case 2:
        return <Medal size={18} className="text-slate-400 flex-shrink-0" />;
      case 3:
        return <Medal size={18} className="text-amber-600 flex-shrink-0" />;
      default:
        return <span className="text-gray-400 text-xs font-bold w-4 text-center">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-amber-400 text-white shadow-sm shadow-amber-200";
      case 2:
        return "bg-slate-100 text-slate-700 border border-slate-200";
      case 3:
        return "bg-amber-50 text-amber-800 border border-amber-200";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-100";
    }
  };

  const topPerformer = leaderboard[0];
  const studentPercentage = currentStudentRank?.score || 0;
  const topPercentage = topPerformer?.score || 0;
  const percentageBehind = topPercentage - studentPercentage;

  const getRankMessage = () => {
    if (!currentStudentRank) return "Complete more activities to see your rank!";
    
    const rank = currentStudentRank.rank;
    const totalStudents = leaderboard.length;
    const percentile = ((totalStudents - rank) / totalStudents) * 100;
    
    if (rank === 1) {
      return "🏆 You're at the top of the class! Keep leading!";
    } else if (rank <= 3) {
      return `🌟 You're in the top ${Math.round(percentile)}%! Keep pushing for #1!`;
    } else if (rank <= Math.ceil(totalStudents * 0.1)) {
      return `🎉 You're in the top 10% of this class! Excellent work!`;
    } else if (rank <= Math.ceil(totalStudents * 0.25)) {
      return `📈 You're in the top 25%! Keep up the great momentum!`;
    } else if (rank <= Math.ceil(totalStudents * 0.5)) {
      return `💪 You're above average! Complete more activities to climb higher!`;
    } else {
      return `✨ Keep learning! Every assignment and quiz helps improve your rank!`;
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-5 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-around items-end h-28 border-b border-gray-100 pb-2">
          <div className="h-16 w-12 bg-gray-200 rounded-t" />
          <div className="h-24 w-14 bg-gray-200 rounded-t" />
          <div className="h-14 w-12 bg-gray-200 rounded-t" />
        </div>
        <div className="h-16 bg-gray-100 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-5 min-w-0 box-border">
      
    
      <div className="flex w-fit items-center justify-between border-b border-gray-50 pb-2">
        <div className="flex items-center w-full gap-x-2">
          <Star size={20} className="text-emerald-600 fill-emerald-100" />
          <h2 className="font-extrabold w-full text-[1.5rem]  sm:text-[1rem] text-gray-900 leading-tight">
            Class Leaderboard
          </h2>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Rankings
        </span>
      </div>

    
      {leaderboard.length > 0 && (
        <div className="flex justify-around items-end gap-2 my-2 sm:px-4">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <div className="text-center flex-1 max-w-[100px]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center mb-1 overflow-hidden shadow-inner">
                {leaderboard[1].profilePicture ? (
                  <img 
                    src={getImageUrl(leaderboard[1].profilePicture)} 
                    alt={leaderboard[1].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-600 font-bold text-sm uppercase">
                    {leaderboard[1].firstName?.[0]}{leaderboard[1].lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-gray-700 truncate">
                {leaderboard[1].firstName}
              </div>
              <div className="text-[11px] font-semibold text-slate-500">{leaderboard[1].score}%</div>
              <div className="text-sm mt-0.5">🥈</div>
            </div>
          )}
          
          {/* 1st Place */}
          {leaderboard[0] && (
            <div className="text-center flex-1 max-w-[110px] -mt-2">
              <div className="min-w-16 min-h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-amber-50 border-4 border-amber-400 flex items-center justify-center mb-1 overflow-hidden shadow-md relative">
                {leaderboard[0].profilePicture ? (
                  <img 
                    src={getImageUrl(leaderboard[0].profilePicture)} 
                    alt={leaderboard[0].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-amber-700 font-black text-lg uppercase">
                    {leaderboard[0].firstName?.[0]}{leaderboard[0].lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="text-sm font-black text-gray-900 truncate">
                {leaderboard[0].firstName}
              </div>
              <div className="text-xs font-extrabold text-amber-600">{leaderboard[0].score}%</div>
              <div className="text-base leading-none">👑</div>
            </div>
          )}
          
          {/* 3rd Place */}
          {leaderboard[2] && (
            <div className="text-center flex-1 max-w-[100px]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-amber-50/50 border-2 border-amber-700/30 flex items-center justify-center mb-1 overflow-hidden shadow-inner">
                {leaderboard[2].profilePicture ? (
                  <img 
                    src={getImageUrl(leaderboard[2].profilePicture)} 
                    alt={leaderboard[2].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-amber-800 font-bold text-sm uppercase">
                    {leaderboard[2].firstName?.[0]}{leaderboard[2].lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-gray-700 truncate">
                {leaderboard[2].firstName}
              </div>
              <div className="text-[11px] font-semibold text-amber-700">{leaderboard[2].score}%</div>
              <div className="text-sm mt-0.5">🥉</div>
            </div>
          )}
        </div>
      )}

    
      {currentStudentRank && (
        <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 border border-emerald-200 transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-x-2 min-w-0">
              <span className={`flex items-center gap-x-2  px-4 py-1 rounded-full text-[0.7em] sm:text-xs font-black tracking-wide ${getRankColor(currentStudentRank.rank)}`}>
                RANK <span className="flex items-center">#{currentStudentRank.rank}</span>
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-gray-900 truncate">
                {currentStudent?.firstName} {currentStudent?.lastName} (You)
              </span>
            </div>
            <span className="font-black text-emerald-600 text-sm sm:text-base">
              {currentStudentRank.score}%
            </span>
          </div>

     
          <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden mt-1.5">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, currentStudentRank.score))}%` }}
            />
          </div>
          
          {percentageBehind > 0 && currentStudentRank.rank !== 1 && (
            <p className="text-[11px] font-medium text-emerald-700/80 mt-2">
              📉 You are <span className="font-bold">{percentageBehind}%</span> behind the top performer
            </p>
          )}
        </div>
      )}
      
    
      <div className="bg-gray-50/70 border border-gray-100 rounded-xl px-3 py-2.5">
        <p className="text-xs text-gray-600 font-medium leading-relaxed">
          {getRankMessage()}
        </p>
      </div>

  
      {leaderboard.length > 3 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Top 10 Performance</p>
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
            {leaderboard.slice(0, 10).map((student) => {
              const isCurrentUser = student.studentId === currentStudent?._id;
              return (
                <div 
                  key={student.studentId} 
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    isCurrentUser ? "bg-emerald-50/50 border border-emerald-100 font-semibold" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-x-2.5 min-w-0">
                    {getRankIcon(student.rank)}
                    <span className={`truncate text-gray-700 ${isCurrentUser ? "text-gray-900 font-bold" : ""}`}>
                      {student.name}
                    </span>
                  </div>
                  <span className={`font-bold ${isCurrentUser ? "text-emerald-600 text-sm" : "text-gray-500"}`}>
                    {student.score}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassLeaderboard;