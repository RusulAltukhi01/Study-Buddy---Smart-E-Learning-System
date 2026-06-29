import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import "./ForgotPassword.css";

const STEPS = { EMAIL: "email", OTP: "otp", PASSWORD: "password", DONE: "done" };

const ForgotPassword = () => {
  const [step, setStep]             = useState(STEPS.EMAIL);
  const [email, setEmail]           = useState("");
  const [otp, setOtp]               = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});

  const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();
  const navigate = useNavigate();


  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) setStep(STEPS.OTP);
  };


  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setErrors({ otp: "Please enter the full 6-digit code" });
      return;
    }
    setLoading(true);
    const result = await verifyResetOtp(email, code);
    setLoading(false);
    if (result.success) {
      setResetToken(result.resetToken);
      setStep(STEPS.PASSWORD);
    }
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    const newErrors = {};

    if (!passwordRegex.test(password)) {
      newErrors.password = "8-15 chars with uppercase, lowercase, number & special character";
    }
    if (password !== confirm) {
      newErrors.confirm = "Passwords do not match";
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, resetToken, password);
    setLoading(false);
    if (result.success) {
      setStep(STEPS.DONE);
      setTimeout(() => navigate("/login"), 2500);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="blob blob-top" />
        <div className="blob blob-bottom" />
        <div className="login-hero">
          <h1 className="login-hero-title">
            Reset Your<br />
            <span className="login-hero-accent">Password</span>
          </h1>
          <p className="login-hero-desc">
            {step === STEPS.EMAIL   && "Enter your email and we'll send you a 6-digit reset code."}
            {step === STEPS.OTP     && "Check your inbox for the 6-digit code we just sent."}
            {step === STEPS.PASSWORD && "Choose a strong new password for your account."}
            {step === STEPS.DONE    && "All done! Redirecting you to login..."}
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

        
          <div className="fp-steps">
            {["Email", "Verify", "Reset"].map((label, i) => {
              const stepIndex = [STEPS.EMAIL, STEPS.OTP, STEPS.PASSWORD].indexOf(step);
              const active  = i === stepIndex;
              const done    = i < stepIndex || step === STEPS.DONE;
              return (
                <div key={label} className="fp-step-item">
                  <div className={`fp-step-circle ${done ? "done" : active ? "active" : ""}`}>
                    {done ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`fp-step-label ${active ? "active" : ""}`}>{label}</span>
                  {i < 2 && <div className={`fp-step-line ${done ? "done" : ""}`} />}
                </div>
              );
            })}
          </div>

       
          {step === STEPS.EMAIL && (
            <>
              <h2 className="login-card-title">Forgot password?</h2>
              <form onSubmit={handleSendOtp} className="login-form" noValidate>
                <div className="login-field">
                  <label className="login-label">Email Address</label>
                  <div className={`login-input-wrap ${errors.email ? "input-error" : ""}`}>
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="4"/><path d="M20 12a8 8 0 10-3.4 6.6" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors({}); }}
                      placeholder="name@company.com"
                      className="login-input"
                    />
                  </div>
                  {errors.email && <p className="login-error">{errors.email}</p>}
                </div>
                <button type="submit" disabled={loading} className={`login-btn ${loading ? "login-btn--loading" : ""}`}>
                  {loading ? <span className="login-spinner" /> : <>Send reset code <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
                </button>
                <p className="login-signup-text">
                  Remembered it? <NavLink to="/login" className="login-signup-link">Back to login</NavLink>
                </p>
              </form>
            </>
          )}

       
          {step === STEPS.OTP && (
            <>
              <h2 className="login-card-title">Enter the code</h2>
              <p className="fp-subtitle">Sent to <strong>{email}</strong></p>
              <form onSubmit={handleVerifyOtp} className="login-form" noValidate>
                <div className="fp-otp-row">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`fp-otp-input ${errors.otp ? "input-error" : ""}`}
                    />
                  ))}
                </div>
                {errors.otp && <p className="login-error" style={{textAlign:"center"}}>{errors.otp}</p>}
                <button type="submit" disabled={loading} className={`login-btn ${loading ? "login-btn--loading" : ""}`}>
                  {loading ? <span className="login-spinner" /> : <>Verify code <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
                </button>
                <p className="login-signup-text">
                  Didn't receive it?{" "}
                  <button type="button" className="login-signup-link fp-resend-btn"
                    onClick={async () => {
                      setLoading(true);
                      await forgotPassword(email);
                      setLoading(false);
                      setOtp(["","","","","",""]);
                      toast.success("New code sent!");
                    }}>
                    Resend
                  </button>
                </p>
              </form>
            </>
          )}

  
          {step === STEPS.PASSWORD && (
            <>
              <h2 className="login-card-title">New password</h2>
              <form onSubmit={handleResetPassword} className="login-form" noValidate>
                <div className="login-field">
                  <label className="login-label">New Password</label>
                  <div className={`login-input-wrap ${errors.password ? "input-error" : ""}`}>
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input type="password" value={password}
                      onChange={e => { setPassword(e.target.value); setErrors({}); }}
                      placeholder="••••••••" className="login-input" />
                  </div>
                  {errors.password && <p className="login-error">{errors.password}</p>}
                </div>
                <div className="login-field">
                  <label className="login-label">Confirm Password</label>
                  <div className={`login-input-wrap ${errors.confirm ? "input-error" : ""}`}>
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input type="password" value={confirm}
                      onChange={e => { setConfirm(e.target.value); setErrors(prev => ({...prev, confirm: ""})); }}
                      placeholder="••••••••" className="login-input" />
                  </div>
                  {errors.confirm && <p className="login-error">{errors.confirm}</p>}
                </div>
                <button type="submit" disabled={loading} className={`login-btn ${loading ? "login-btn--loading" : ""}`}>
                  {loading ? <span className="login-spinner" /> : <>Reset password <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
                </button>
              </form>
            </>
          )}

        
          {step === STEPS.DONE && (
            <div className="fp-done">
              <div className="fp-done-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="login-card-title" style={{textAlign:"center"}}>Password reset!</h2>
              <p className="fp-subtitle" style={{textAlign:"center"}}>Redirecting you to login...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;