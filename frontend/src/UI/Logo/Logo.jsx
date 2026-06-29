
import { NavLink } from "react-router-dom";
import "./Logo.css";

export const Logo = ({color}) => {
  return (
    <NavLink to="/">
      <div className="logo cursor-pointer w-17 h-17 flex justify-center items-center p-1  ">
        {/* <span className="study" style={{color: `var(--${color})`}}>Study</span>
        <span className="buddy electric-gradient-text" style={{color: "var(--electric)"}}>Buddy</span> */}
        <img className="object-fill " src={"/full-study-buddy-logo.png"} alt="study-buddy-logo" />
      </div>
    </NavLink>
  );
};

export default Logo;
