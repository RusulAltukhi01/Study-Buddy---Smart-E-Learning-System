
import "./LinearProgressbar.css";
import ProgressBar from "@ramonak/react-progress-bar";

const LinearProgressbar = ({value, width}) => {
  return (
    <div style={{ width: width, maxWidth: "500px"}}>
      <ProgressBar
        completed={value}   // progress value 0-100
        height="15px"       // bar height
        labelSize="12px"
        bgColor="var(--electric)"   // filled color
        baseBgColor="#e0e0e0" // background color
        labelAlignment="center" // label inside bar
        labelColor="#fff"      // label color
        animateOnRender={true} // smooth animation
      />
    </div>
  );
};

export default LinearProgressbar;
