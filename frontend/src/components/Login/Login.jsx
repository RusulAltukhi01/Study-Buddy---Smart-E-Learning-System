import "./Login.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validationRules = {
    email: (value) => {
      if (!value.trim()) return "Email address is required";
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      return "";
    },
    password: (value) => {
      if (!value.trim()) return "Password is required";
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
      if (!passwordRegex.test(value)) {
        return "Password must be 8-15 characters with at least one uppercase letter, one lowercase letter, one number, and one special character (@.#$!%*?&)";
      }
      return "";
    },
  };

  const validateField = (name, value) => {
    if (validationRules[name]) {
      return validationRules[name](value, formData);
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      newErrors[field] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const allTouched = Object.keys(touched).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error(
        "Please review and correct the highlighted field(s) before submitting",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      setLoading(false);

      if (result.success) {
        // toast.success("Logined In successfully! Welcome to our platform");

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setFormData((prev) => ({ ...prev, password: "" }));
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Error! Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="blob blob-top" />
        <div className="blob blob-bottom" />


        <div className="login-hero">
          <h1 className="login-hero-title">
            Welcome
            <br />
            <span className="login-hero-accent">Back</span>
          </h1>
          <p className="login-hero-desc">
            Continue your journey with StudyBuddy. Access your personalized
            learning dashboard and track your progress.
          </p>
        </div>
      </div>


      <div className="login-right">
        <div className="login-card">
          <h2 className="login-card-title">Login</h2>

          <form onSubmit={handleSubmit} className="login-form" noValidate>

            <div className="login-field">
              <label className="login-label">Email Address</label>
              <div
                className={`login-input-wrap ${touched.email && errors.email ? "input-error" : ""}`}
              >
                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M20 12a8 8 0 10-3.4 6.6" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="name@company.com"
                  className="login-input"
                  required
                />
              </div>
              {touched.email && errors.email && (
                <p className="login-error">{errors.email}</p>
              )}
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label className="login-label">Password</label>
                <NavLink to="/forgot-password" className="login-forgot">
                  Forgot Password?
                </NavLink>
              </div>
              <div
                className={`login-input-wrap ${touched.password && errors.password ? "input-error" : ""}`}
              >
                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className="login-input"
                  required
                />
              </div>
              {touched.password && errors.password && (
                <p className="login-error">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-btn ${loading ? "login-btn--loading" : ""}`}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  Login
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>


            <p className="login-signup-text">
              New here?{" "}
              <NavLink to="/join" className="login-signup-link">
                Create an account
              </NavLink>
            </p>
          </form>
        </div>


      </div>
    </div>
  );
};

export default Login;
