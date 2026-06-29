
import { NavLink } from "react-router-dom";
import "./MobileNav.css";

const MobileNav = ({ onClose, logout }) => {
  return (
    <div className="mobile-nav">
      <ul className="flex flex-col justify-between items-center p-3 gap-y-2">
        <NavLink to="/" onClick={onClose}>
          <span className="font-semibold cursor-pointer text-[var(--electric-dark)]">
            Home
          </span>
        </NavLink>
        
        <NavLink to="/summary" onClick={onClose}>
          <span className="font-semibold cursor-pointer text-[var(--electric-dark)]">
            Summarize pdf
          </span>
        </NavLink>
        
        <NavLink to="/quiz" onClick={onClose}>
          <span className="font-semibold cursor-pointer text-[var(--electric-dark)]">
            Generate quiz
          </span>
        </NavLink>
        
        <NavLink to="/profile" onClick={onClose}>
          <span className="font-semibold cursor-pointer text-[var(--electric-dark)]">
            Profile
          </span>
        </NavLink>
        
        <NavLink to="/login" onClick={onClose}>
          <span className="font-semibold cursor-pointer text-[var(--electric-dark)]">
            Login
          </span>
        </NavLink>
        
        <NavLink to="/signup" onClick={onClose}>
          <span className="font-semibold cursor-pointer text-[var(--electric-dark)]">
            Signup
          </span>
        </NavLink>
        
        
        <button 
          onClick={() => {
            logout();
            onClose();
          }}
          className="font-semibold cursor-pointer text-[var(--electric-dark)]"
        >
          Logout
        </button>
      </ul>
    </div>
  );
};

export default MobileNav;
