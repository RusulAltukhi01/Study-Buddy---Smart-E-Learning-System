import "./Signup.css";
import InputField from "../InputField/InputField";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import Logo from "../../UI/Logo/Logo";

const Signup = () => {
  const { role } = useParams();
  const { user, studentSignup, instructorSignup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "instructor") navigate("/instructor/dashboard");
      else if (user.role === "student") navigate("/student/dashboard");
      else navigate("/");
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState(
    role === "instructor" ? "instructor" : "student",
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    headline: "",
    bio: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    headline: "",
    bio: "",
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phoneNumber: false,
    headline: false,
    bio: false,
  });

  const [loading, setLoading] = useState(false);
  // const { studentSignup, instructorSignup } = useAuth();
  // const navigate = useNavigate();

  const validationRules = {
    firstName: (v) => {
      if (!v.trim()) return "First name is required";
      if (v.length < 2) return "At least 2 characters";
      if (v.length > 15) return "Cannot exceed 15 characters";
      return "";
    },
    lastName: (v) => {
      if (!v.trim()) return "Last name is required";
      if (v.length < 2) return "At least 2 characters";
      if (v.length > 15) return "Cannot exceed 15 characters";
      return "";
    },
    email: (v) => {
      if (!v.trim()) return "Email is required";
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))
        return "Enter a valid email";
      return "";
    },
    password: (v) => {
      if (!v.trim()) return "Password is required";
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
      if (!passwordRegex.test(v))
        return "Password must be 8-15 characters with uppercase, lowercase, number, and special character (@.#$!%*?&)";
      return "";
    },
    confirmPassword: (v, all) => {
      if (!v.trim()) return "Please confirm your password";
      if (v !== all.password) return "Passwords do not match";
      return "";
    },
    phoneNumber: (v) => {
      if (!v.trim()) return "Phone number is required";
      if (!/^[+]?[1-9][\d]{0,15}$/.test(v.trim()))
        return "Enter a valid phone number";
      return "";
    },
    headline: (v) => {
      if (activeTab === "instructor") {
        if (!v.trim()) return "Headline is required";
        if (v.trim().length > 100) return "Max 100 characters";
      }
      return "";
    },
    bio: (v) => {
      if (activeTab === "instructor") {
        if (!v.trim()) return "Bio is required";
        if (v.trim().length < 50) return "At least 50 characters";
        if (v.trim().length > 1000) return "Max 1000 characters";
      }
      return "";
    },
  };

  const validateField = (name, value) =>
    validationRules[name] ? validationRules[name](value, formData) : "";

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;
    [
      "firstName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
      "phoneNumber",
    ].forEach((f) => {
      const err = validateField(f, formData[f]);
      newErrors[f] = err;
      if (err) hasErrors = true;
    });
    if (activeTab === "instructor") {
      ["headline", "bio"].forEach((f) => {
        const err = validateField(f, formData[f]);
        newErrors[f] = err;
        if (err) hasErrors = true;
      });
    }
    setErrors(newErrors);
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (touched[name])
      setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name, formData[name]) }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setTouched(Object.fromEntries(Object.keys(touched).map((k) => [k, false])));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTouched(Object.fromEntries(Object.keys(touched).map((k) => [k, true])));
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before submitting");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        ...(activeTab === "instructor" && {
          headline: formData.headline,
          bio: formData.bio,
        }),
      };
      const result = await (activeTab === "student"
        ? studentSignup(payload)
        : instructorSignup(payload));
      if (result.success) {
        toast.success("OTP sent to your email!");
        navigate("/verify-otp"); 

        // toast.success("Account created successfully! Welcome to StudyBuddy");
        // navigate("/");
      } else {
        toast.error(result.error || "Registration failed. Please try again");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isInstructor = activeTab === "instructor";

  return (
    <div className="signup-page">
      
      <div className="signup-orb signup-orb--1" />
      <div className="signup-orb signup-orb--2" />
      <div className="signup-orb signup-orb--3" />

      <div className="signup-container">
        <div className="signup-panel">
          <div className="signup-panel__logo">
            <Logo color="white" />
          </div>

          <div className="signup-panel__body">
            <h2 className="signup-panel__title">
              Start your
              <br />
              <span className="signup-panel__accent">journey today.</span>
            </h2>
            <p className="signup-panel__desc">
              {isInstructor
                ? "Share your expertise with thousands of eager learners worldwide."
                : "Access AI-powered tools, track your progress, and grow every day."}
            </p>

            <div className="signup-panel__features">
              {(isInstructor
                ? [
                    "Design your own curriculum",
                    "Track student progress",
                    "AI-powered tools",
                  ]
                : [
                    "Personalized learning paths",
                    "Interactive learning",
                    "Progress analytics",
                  ]
              ).map((f) => (
                <div key={f} className="signup-panel__feature">
                  <span className="signup-panel__feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="signup-panel__badge">
            {isInstructor ? "👨‍🏫 Instructor Mode" : "🎓 Student Mode"}
          </div>
        </div>

        <div className="signup-form-panel">
          <h1 className="signup-form-title">Create Account</h1>

          <div className="signup-tabs">
            <button
              type="button"
              className={`signup-tab ${activeTab === "student" ? "signup-tab--active" : ""}`}
              onClick={() => handleTabChange("student")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              Student
            </button>
            <button
              type="button"
              className={`signup-tab ${activeTab === "instructor" ? "signup-tab--active" : ""}`}
              onClick={() => handleTabChange("instructor")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              Instructor
            </button>
          </div>

          <p className="signup-tab-hint">
            {isInstructor
              ? "Share your knowledge and create impactful learning experiences"
              : "Join as a learner to access courses and track your progress"}
          </p>

          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            <div className="signup-row">
              <div className="signup-field">
                <InputField
                  label="First Name"
                  inputType="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && errors.firstName}
                  required
                />
                {touched.firstName && errors.firstName && (
                  <p className="signup-error">{errors.firstName}</p>
                )}
              </div>
              <div className="signup-field">
                <InputField
                  label="Last Name"
                  inputType="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && errors.lastName}
                  required
                />
                {touched.lastName && errors.lastName && (
                  <p className="signup-error">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="signup-field">
              <InputField
                label="Email Address"
                inputType="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
                required
              />
              {touched.email && errors.email && (
                <p className="signup-error">{errors.email}</p>
              )}
            </div>

            <div className="signup-field">
              <InputField
                label="Phone Number"
                inputType="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phoneNumber && errors.phoneNumber}
                required
                placeholder="+1 (123) 456-7890"
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="signup-error">{errors.phoneNumber}</p>
              )}
            </div>

            {isInstructor && (
              <>
                <div className="signup-field">
                  <InputField
                    label="Professional Headline"
                    inputType="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.headline && errors.headline}
                    required
                    placeholder="e.g. Senior Developer at Tech Corp"
                  />
                  {touched.headline && errors.headline && (
                    <p className="signup-error">{errors.headline}</p>
                  )}
                  <p className="signup-hint">Max 100 characters</p>
                </div>

                <div className="signup-field">
                  <label className="signup-label">
                    Bio <span className="signup-label__required">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`signup-textarea ${touched.bio && errors.bio ? "signup-textarea--error" : ""}`}
                    rows="4"
                    placeholder="Tell us about your professional background, experience, and teaching philosophy..."
                  />
                  {touched.bio && errors.bio && (
                    <p className="signup-error">{errors.bio}</p>
                  )}
                  <div className="signup-textarea-meta">
                    <span className="signup-hint">50–1000 characters</span>
                    <span
                      className={`signup-hint ${formData.bio.length > 950 ? "signup-hint--warn" : ""}`}
                    >
                      {formData.bio.length}/1000
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="signup-row">
              <div className="signup-field">
                <InputField
                  label="Password"
                  inputType="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                  required
                />
                {/* {touched.password && errors.password ? (
                  <p className="signup-error">{errors.password}</p>
                ) : (
 
                  <p className="signup-hint">
                    8-15 chars · uppercase · lowercase · number · special
                    (@.#$!%*?&)
                  </p>
                )} */}
              </div>
              <div className="signup-field">
                <InputField
                  label="Confirm Password"
                  inputType="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && errors.confirmPassword}
                  required
                />
                {/* {touched.confirmPassword && errors.confirmPassword && (
                  <p className="signup-error">{errors.confirmPassword}</p>
                )} */}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`signup-btn ${loading ? "signup-btn--loading" : ""}`}
            >
              {loading ? (
                <>
                  <span className="signup-spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  Sign up as {isInstructor ? "Instructor" : "Student"}
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

            <p className="signup-login-text">
              Already have an account?{" "}
              <NavLink to="/login" className="signup-login-link">
                Login
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
