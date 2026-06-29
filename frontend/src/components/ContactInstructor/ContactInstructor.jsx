import { Mail, SendHorizontal } from "lucide-react";

const ContactInstructor = ({ instructor }) => {
  
  const email = instructor?.email || "";
  const firstName = instructor?.firstName || "your";
  const lastName = instructor?.lastName || "Instructor";
  const fullName = `${instructor?.firstName || ""} ${instructor?.lastName || ""}`.trim() || "Instructor";

  const handleSendEmail = () => {
    if (!email) {
      window.location.href = `mailto:?subject=Question regarding Course Materials`;
      return;
    }

    const subject = encodeURIComponent("Question regarding Course Materials & Progress");
    const body = encodeURIComponent(
      `Hello Professor ${lastName},\n\nI hope this email finds you well.\n\nI am reaching out regarding a question on our course materials.\n\nBest regards,\n[Your Name]`
    );

    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="w-full bg-white p-5 sm:p-6 flex flex-col justify-between gap-5 rounded-2xl border border-gray-100 shadow-sm">
      <header className="w-full flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-gray-800 font-extrabold text-base tracking-tight">
          <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Mail size={16} />
          </span> 
          Contact Instructor
        </h2>
        <p className="font-medium text-gray-400 text-xs leading-relaxed">
          Have a specific question about the course materials or your progress with {firstName === "your" ? "your instructor" : fullName}?
        </p>
      </header>

      <button
        type="button"
        onClick={handleSendEmail}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-emerald-700 hover:shadow transition-all cursor-pointer group"
      >
        <span>Send Email</span>
        <SendHorizontal size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default ContactInstructor;