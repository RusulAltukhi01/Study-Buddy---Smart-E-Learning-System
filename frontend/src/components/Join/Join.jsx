import "./Join.css";
import instructorIcon from "../../assets/mentor.png";
import studentIcon from "../../assets/student (1).png";
import { NavLink } from "react-router-dom";
import Logo from "../../UI/Logo/Logo";

const Join = () => {
  return (
    <div className="join">

      <div className="join-hero">
        <h1 className="join-title ">
          Choose your journey
        </h1>
        <p className="join-subtitle">
          Personalized AI-powered learning paths for every step of your
          educational career. Join our global community today.
        </p>
      </div>


      <div className="cards-container">

        <div className="join-card">
          <div className="card-icon-wrapper card-icon-instructor">
            <img src={instructorIcon} alt="Instructor" className="card-icon-img" loading="lazy" />
          </div>
          <h2 className="card-title">I'm an Instructor</h2>
          <p className="card-desc">
            Design curriculum, track student progress, and leverage AI to enhance
            your teaching experience.
          </p>
          <NavLink to="/signup/instructor" className="card-btn card-btn-instructor">
            Signup as Instructor
          </NavLink>
        </div>


        <div className="join-card">
          <div className="card-icon-wrapper card-icon-student">
            <img src={studentIcon} alt="Student" className="card-icon-img" loading="lazy" />
          </div>
          <h2 className="card-title">I'm a Student</h2>
          <p className="card-desc">
            Access smart study tools, interactive lessons, and personalized
            feedback to excel in your studies.
          </p>
          <NavLink to="/signup/student" className="card-btn card-btn-student">
            Signup as Student
          </NavLink>
        </div>
      </div>

      <p className="join-login-text">
        Already have an account?{" "}
        <NavLink to="/login" className="join-login-link">
          Log in here
        </NavLink>
      </p>
    </div>
  );
};

export default Join;