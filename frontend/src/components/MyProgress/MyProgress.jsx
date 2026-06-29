import "./MyProgress.css";

function EmeraldCircularProgress({ progress = 0, size = 200 }) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const strokeWidth = size * 0.09;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeProgress / 100) * circumference;
  const center = size / 2;
  const gradientId = "emerald-progress-gradient";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#d1fae5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>

   
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-black leading-none text-emerald-700"
          style={{ fontSize: size * 0.22 }}
        >
          {Math.round(safeProgress)}%
        </span>
        <span
          className="font-semibold text-emerald-500 mt-1 tracking-wide uppercase"
          style={{ fontSize: size * 0.08 }}
        >
          Done
        </span>
      </div>
    </div>
  );
}


export function ProgressCard({ title, info, subtitle, accent = false }) {
  return (
    <div
      className={`
        flex flex-col justify-between gap-2 p-3 sm:p-4 rounded-xl border transition-shadow hover:shadow-md min-w-0
        ${accent
          ? "bg-emerald-50 border-emerald-200"
          : "bg-gray-50 border-gray-200"
        }
      `}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-500 truncate">
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] text-gray-400 truncate">{subtitle}</span>
        )}
      </div>
      <span
        className={`font-black leading-none text-[1.5rem] sm:text-[1.8rem] truncate ${
          accent ? "text-emerald-600" : "electric-gradient-text"
        }`}
      >
        {info}
      </span>
    </div>
  );
}


const MyProgress = ({ student, progress, classroom }) => {
  
  if (!student || !progress) {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 animate-pulse">
      
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="rounded-full bg-gray-200 flex-shrink-0" style={{ width: 160, height: 160 }} />
          <div className="flex flex-col gap-3 w-full">
            <div className="h-7 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
            <div className="h-3 w-44 bg-gray-200 rounded" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }


  const studentName = student.firstName || "Student";
  const classroomName = classroom?.name || "this class";

  const completedQuizzes = progress.completedQuizzes || 0;
  const totalQuizzes = progress.totalQuizzes || 0;
  const completedAssignments = progress.completedAssignments || 0;
  const totalAssignments = progress.totalAssignments || 0;
  const completionRate = progress.completionRate || 0;
  const overallAverage = progress.overallAverage || 0;
  const averageQuizScore = progress.averageQuizScore || 0;
  const averageAssignmentScore = progress.averageAssignmentScore || 0;

  const totalItems = progress.totalItems || totalQuizzes + totalAssignments;
  const completedItems = progress.completedItems || completedQuizzes + completedAssignments;

  const getGradeLetter = (score) => {
    if (score >= 97) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "A-";
    if (score >= 87) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B-";
    if (score >= 77) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C-";
    if (score >= 67) return "D+";
    if (score >= 63) return "D";
    if (score >= 60) return "D-";
    return "F";
  };

  const gradeLetter = getGradeLetter(overallAverage);

  const getEncouragingMessage = () => {
    if (completionRate >= 90) return `Amazing work, ${studentName}! Almost done with ${classroomName}! 🎉`;
    if (completionRate >= 75) return `Excellent progress, ${studentName}! Keep pushing! 💪`;
    if (completionRate >= 50) return `Great job, ${studentName}! Solid progress in ${classroomName}! 🌟`;
    if (completionRate >= 25) return `Good start, ${studentName}! Stay consistent! 📚`;
    if (completionRate > 0)  return `Welcome, ${studentName}! Every step counts. Let's go! 🚀`;
    return `Ready to start, ${studentName}! Your journey in ${classroomName} begins now! ✨`;
  };


  const chartSize = 160;

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-5 min-w-0 box-border">

     
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 min-w-0">

  
        <div className="flex-shrink-0">
          <EmeraldCircularProgress progress={completionRate} size={chartSize} />
        </div>

   
        <div className="flex flex-col gap-1 min-w-0 w-full text-center sm:text-left justify-center sm:pt-2">
          <h2 className="font-extrabold text-[1.5rem] sm:text-[1.75rem] text-gray-900 leading-tight">
            My Progress
          </h2>
          <p className="text-sm font-medium text-gray-500 leading-snug">
            {getEncouragingMessage()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {completedItems} of {totalItems} items completed ({Math.round(completionRate)}%)
          </p>

          
          <div className="mt-3 w-full max-w-xs mx-auto sm:mx-0 bg-emerald-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.round(completionRate)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 min-w-0">
        <ProgressCard
          title="Overall Grade"
          info={gradeLetter}
          subtitle={`${Math.round(overallAverage)}% avg`}
          accent
        />
        <ProgressCard
          title="Quizzes"
          info={`${completedQuizzes}/${totalQuizzes}`}
          subtitle={`Avg ${Math.round(averageQuizScore)}%`}
        />
        <ProgressCard
          title="Assignments"
          info={`${completedAssignments}/${totalAssignments}`}
          subtitle={`Avg ${Math.round(averageAssignmentScore)}%`}
        />
      </div>
    </div>
  );
};

export default MyProgress;