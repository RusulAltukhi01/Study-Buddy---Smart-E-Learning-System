import "./CircularProgress.css";
import {
  CircularProgressbar,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CircularProgress = ({ progress, width, height }) => {
  // const gradientAngle = (progress / 100) * 360;
  
  return (
    <div 
      className="circular-progress-wrapper"
      style={{ 
        width: width, 
        height: height,
        position: "relative"
      }}
    >

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient 
            id="gradientMirror" 
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="100%"
          >
            {/* Mirror gradient colors */}
            <stop offset="0%" stopColor="#8b5cf6" />    {/* Purple */}
            <stop offset="20%" stopColor="#06b6d4" />   {/* Cyan */}
            <stop offset="40%" stopColor="#ec4899" />   {/* Pink */}
            <stop offset="60%" stopColor="#06b6d4" />   {/* Cyan (mirror) */}
            <stop offset="80%" stopColor="#8b5cf6" />   {/* Purple (mirror) */}
            <stop offset="100%" stopColor="#a855f7" />  {/* Light Purple */}
          </linearGradient>
          

          <linearGradient 
            id="gradientTealMirror" 
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="100%"
          >
            <stop offset="0%" stopColor="#00c4b4" />
            <stop offset="25%" stopColor="#00b8d4" />
            <stop offset="50%" stopColor="#0091ea" />
            <stop offset="75%" stopColor="#00b8d4" />
            <stop offset="100%" stopColor="#00c4b4" />
          </linearGradient>
          
     
          <linearGradient 
            id="gradientElectric" 
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="100%"
          >
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="20%" stopColor="#ffd93d" />
            <stop offset="40%" stopColor="#6bcb77" />
            <stop offset="60%" stopColor="#4d96ff" />
            <stop offset="80%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#ffd93d" />
          </linearGradient>
        </defs>
      </svg>
      
      <CircularProgressbar
        value={progress}
        text={`${Math.round(progress)}%`}
        strokeWidth={8}
        styles={buildStyles({
          pathColor: "url(#gradientTealMirror)",
          textColor: "#1e293b",
          trailColor: "#e2e8f0",
          strokeLinecap: "round",
          pathTransitionDuration: 1,
          textSize: "24px",
          textWeight: "bold",
        })}
      />
    </div>
  );
};

export default CircularProgress;