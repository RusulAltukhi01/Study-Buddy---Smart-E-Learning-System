import { useCallback, useState } from "react";
import { X, Copy, Check, RefreshCw, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import classroomService from "../../src/services/classroomService";
import { useNavigate } from "react-router-dom";



const STEPS = ["Basic info", "Settings", "Access"];

const StepBar = ({ step }) => (
  <div className="flex items-center justify-center gap-0 px-6 py-5 border-b border-slate-100">
    {STEPS.map((label, i) => {
      const s = i + 1;
      const active = step === s;
      const done = step > s;
      return (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                transition-all duration-300
                ${
                  done
                    ? "bg-[var(--electric)] text-white scale-100"
                    : active
                      ? "bg-[var(--electric)] text-white scale-110 shadow-[0_0_0_4px_rgba(239,118,5,0.18)]"
                      : "bg-slate-100 text-slate-400"
                }
              `}
            >
              {done ? <Check size={14} /> : s}
            </div>
            <span
              className={`text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-200 ${
                active || done ? "text-[var(--electric)]" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </div>

          {s < STEPS.length && (
            <div className="w-16 sm:w-24 h-[3px] rounded-full mx-3 mb-5 bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[var(--electric)] rounded-full transition-all duration-400"
                style={{ width: done ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);



const ToggleRow = ({ label, description, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-all duration-150">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-800 leading-tight">
        {label}
      </p>
      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
        {description}
      </p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        disabled={disabled}
      />
      <div
        className="
        w-11 h-6 rounded-full bg-slate-200
        peer-checked:bg-[var(--electric)]
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border after:border-slate-300 after:rounded-full
        after:h-5 after:w-5 after:transition-all
        peer-checked:after:translate-x-full peer-checked:after:border-white
        transition-colors duration-200
      "
      />
    </label>
  </div>
);



const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
      {label}
      {required && <span className="text-[var(--electric)] ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = `
  w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white
  text-slate-800 placeholder:text-slate-300
  focus:outline-none focus:border-[var(--electric)] focus:ring-2 focus:ring-[var(--electric)]/15
  transition-all duration-150
  disabled:opacity-50 disabled:cursor-not-allowed
`;


export const CreateRoomForm = ({ onClose, editingRoom, onSave }) => {
  const [step, setStep] = useState(1);
  const [internalLoading, setInternalLoading] = useState(false);
  const navigate = useNavigate();

  const loading = internalLoading;

  const [roomData, setRoomData] = useState({
    name: editingRoom?.name || "",
    description: editingRoom?.description || "",
    subject: editingRoom?.subject || "",
    level: editingRoom?.level || "",
    isPrivate:
      editingRoom?.isPrivate !== undefined ? editingRoom.isPrivate : true,
    accessCode: editingRoom?.accessCode || "",
    settings: {
      allowLateSubmissions:
        editingRoom?.settings?.allowLateSubmissions || false,
      autoGrade: editingRoom?.settings?.autoGrade || false,
      showGradesToStudents:
        editingRoom?.settings?.showGradesToStudents || false,
      allowStudentDiscussion:
        editingRoom?.settings?.allowStudentDiscussion || false,
    },
  });

  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const generateRoomCode = () => {
    const prefix = "SB";
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${prefix}-${timestamp}-${random}`;
    setGeneratedCode(code);
    setRoomData((prev) => ({ ...prev, accessCode: code }));
    return code;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomData.accessCode || generatedCode);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const canProceedToNextStep = () => {
    if (step === 1 && !roomData.name.trim()) {
      toast.error("Please enter a room name");
      return false;
    }
    return true;
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setRoomData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleNestedChange = useCallback((category, field, value) => {
    setRoomData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomData.name.trim()) {
      toast.error("Please enter a room name");
      setStep(1);
      return;
    }

    let finalAccessCode = roomData.accessCode || generatedCode;
    if (!finalAccessCode) finalAccessCode = generateRoomCode();

    const finalRoomData = {
      name: roomData.name,
      description: roomData.description,
      subject: roomData.subject,
      level: roomData.level ? String(roomData.level) : "",
      isPrivate: roomData.isPrivate,
      accessCode: finalAccessCode,
      settings: roomData.settings,
    };

    if (onSave) {
      await onSave(finalRoomData, editingRoom);
      return;
    }

    setInternalLoading(true);
    try {
      let response;
      if (editingRoom) {
        response = await classroomService.updateClassroom(
          editingRoom._id,
          finalRoomData,
        );
        toast.success("Classroom updated!");
      } else {
        response = await classroomService.createClassroom(finalRoomData);

      }
      onClose();
      const id = response?.data?._id || response?._id;
      if (id) navigate(`/instructor/classrooms/${id}`);
    } catch (error) {
      toast.error(error?.error || "Failed to save classroom");
    } finally {
      setInternalLoading(false);
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep()) setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const activeCode = roomData.accessCode || generatedCode;

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] pt-[72px] pb-4 px-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl flex flex-col mt-10 bg-white rounded-2xl shadow-2xl border border-slate-100
          overflow-hidden
        "
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          maxHeight: "calc(100dvh - 80px - 1rem)",
        }}
      >
   
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {editingRoom ? "Edit classroom" : "New classroom"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === 1
                ? "Name and describe your room"
                : step === 2
                  ? "Configure how students interact"
                  : "Set up how students join"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

      
        <StepBar step={step} />

      
   
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
         
          {step === 1 && (
            <div className="flex flex-col gap-5">
    
              <Field label="Room name" required>
                <input
                  type="text"
                  name="name"
                  value={roomData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Mathematics 101"
                  className={inputClass}
                  disabled={loading}
                  autoFocus
                />
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  value={roomData.description}
                  onChange={handleInputChange}
                  placeholder="What will students learn in this room?"
                  rows={4}
                  className={`${inputClass} resize-none`}
                  disabled={loading}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Subject">
                  <input
                    type="text"
                    name="subject"
                    value={roomData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics"
                    className={inputClass}
                    disabled={loading}
                  />
                </Field>

                <Field label="Level">
                  <input
                    type="number"
                    name="level"
                    value={roomData.level}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                    min={1}
                    className={inputClass}
                    disabled={loading}
                  />
                </Field>
              </div>
            </div>
          )}

          
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Classroom behaviour
              </p>

              <ToggleRow
                label="Allow late submissions"
                description="Students can submit assignments after the deadline"
                checked={roomData.settings.allowLateSubmissions}
                onChange={(e) =>
                  handleNestedChange(
                    "settings",
                    "allowLateSubmissions",
                    e.target.checked,
                  )
                }
                disabled={loading}
              />
              <ToggleRow
                label="Auto-grade assignments"
                description="Automatically score multiple-choice questions"
                checked={roomData.settings.autoGrade}
                onChange={(e) =>
                  handleNestedChange("settings", "autoGrade", e.target.checked)
                }
                disabled={loading}
              />
              <ToggleRow
                label="Show grades to students"
                description="Students can view their results and scores"
                checked={roomData.settings.showGradesToStudents}
                onChange={(e) =>
                  handleNestedChange(
                    "settings",
                    "showGradesToStudents",
                    e.target.checked,
                  )
                }
                disabled={loading}
              />
              <ToggleRow
                label="Allow student discussion"
                description="Students can post and reply in classroom discussions"
                checked={roomData.settings.allowStudentDiscussion}
                onChange={(e) =>
                  handleNestedChange(
                    "settings",
                    "allowStudentDiscussion",
                    e.target.checked,
                  )
                }
                disabled={loading}
              />

              <div className="mt-2 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Access control
                </p>
                <ToggleRow
                  label="Private classroom"
                  description="Students need an access code to join"
                  checked={roomData.isPrivate}
                  onChange={(e) =>
                    setRoomData((prev) => ({
                      ...prev,
                      isPrivate: e.target.checked,
                    }))
                  }
                  disabled={loading}
                />
              </div>
            </div>
          )}

    
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--dark-navy)]">
                  <div className="flex items-center gap-2">
                    {roomData.isPrivate ? (
                      <Lock size={14} className="text-[var(--electric)]" />
                    ) : (
                      <Unlock size={14} className="text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-white tracking-widest uppercase">
                      {roomData.isPrivate
                        ? "Private — access code required"
                        : "Public classroom"}
                    </span>
                  </div>
                  {roomData.isPrivate && activeCode && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--electric)]/20 text-[var(--electric)] uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </div>

                {roomData.isPrivate ? (
                  <div className="px-5 py-5 bg-slate-50 flex flex-col gap-4">
                    <p className="text-xs text-slate-500">
                      Share this code with students so they can join your
                      classroom.
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-5 py-3.5 text-center">
                        <span
                          className={`font-mono text-xl font-bold tracking-[0.2em] ${activeCode ? "text-[var(--dark-navy)]" : "text-slate-300"}`}
                        >
                          {activeCode || "— — — — — —"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={generateRoomCode}
                          disabled={loading}
                          title="Generate new code"
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--dark-navy)] text-white hover:bg-[var(--electric)] disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <RefreshCw size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          disabled={!activeCode || loading}
                          title="Copy code"
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <Check size={15} className="text-emerald-500" />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    {!activeCode && (
                      <button
                        type="button"
                        onClick={generateRoomCode}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl text-sm font-bold bg-[var(--electric)] text-white hover:bg-[var(--electric-dark)] disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        Generate access code
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-5 bg-slate-50 text-center">
                    <p className="text-sm text-slate-500">
                      This is a public classroom. Any student can join without a
                      code.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      You can make it private on the Settings step.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Summary
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs">Name</span>
                    <p className="font-semibold text-slate-800 truncate">
                      {roomData.name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Subject</span>
                    <p className="font-semibold text-slate-800 truncate">
                      {roomData.subject || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Level</span>
                    <p className="font-semibold text-slate-800">
                      {roomData.level || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Privacy</span>
                    <p className="font-semibold text-slate-800">
                      {roomData.isPrivate ? "Private" : "Public"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--electric)] text-white hover:bg-[var(--electric-dark)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  {editingRoom ? "Saving…" : "Creating…"}
                </>
              ) : editingRoom ? (
                "Save changes"
              ) : (
                "Create classroom"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateRoomForm;
