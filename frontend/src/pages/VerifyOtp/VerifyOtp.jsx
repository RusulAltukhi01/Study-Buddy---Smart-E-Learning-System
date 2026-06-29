import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const VerifyOTP = () => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    const val = value.replace(/\D/g, "");
    if (!val) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }
    const newDigits = [...digits];
    newDigits[index] = val[0];
    setDigits(newDigits);
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    pasted.split("").forEach((ch, i) => { newDigits[i] = ch; });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    const result = await verifyOTP(otp);
    if (result.success) navigate("/");
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    await resendOTP();
    setResending(false);
    setDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    // 30s cooldown
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-10">

    
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
          </div>

       
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a 6-digit verification code to your email. Enter it below to verify your account.
            </p>
          </div>

        
          <form onSubmit={handleVerify}>
            <div className="flex items-center justify-center gap-2 mb-6">
              {digits.map((digit, i) => (
                <>
                  {i === 3 && (
                    <span key="sep" className="text-gray-300 text-xl mx-1">—</span>
                  )}
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-colors"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

         
          <div className="text-center mt-5">
            <p className="text-sm text-gray-400 mb-1">Didn't receive the code?</p>
            {countdown > 0 ? (
              <span className="text-sm text-gray-400">Resend in {countdown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50 transition-colors"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;