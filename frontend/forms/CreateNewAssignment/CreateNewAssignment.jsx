import { useEffect, useRef, useState } from "react";
import {
  X,
  AlignLeft,
  Sparkles,
  FileText,
  Video,
  Trash2,
  Star,
  Rocket,
  Settings,
  Upload,
  Type,
  Link,
  Check,
  Calendar,
  ChevronRight,
} from "lucide-react";
import assignmentService from "../../src/services/assignmentService";
import { toast } from "sonner";



const SUBMISSION_TYPES = [
  {
    id: "file",
    label: "File Upload",
    sublabel: "PDF, Word, etc.",
    icon: Upload,
    accept: ".pdf,.doc,.docx,.ppt,.pptx",
  },
  {
    id: "text",
    label: "Text Entry",
    sublabel: "Written response",
    icon: Type,
    accept: null,
  },
  {
    id: "link",
    label: "Link Submission",
    sublabel: "URL / website",
    icon: Link,
    accept: null,
  },
  {
    id: "video",
    label: "Video Submission",
    sublabel: "MP4, MOV, etc.",
    icon: Video,
    accept: "video/*",
  },
];

const STEPS = [
  { id: "details", label: "Details", icon: AlignLeft },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "materials", label: "Materials", icon: Upload },
];



function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer flex-shrink-0"
      style={{
        width: 44,
        height: 24,
        background: checked ? "#5bc0be" : "#D1D5DB",
      }}
    >
      <span
        className="inline-block bg-white rounded-full shadow transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

function RichTextArea({ value, onChange }) {
  const toolbarItems = [
    { label: <strong>B</strong> },
    { label: <em>I</em> },
    { label: <span className="text-xs">≡</span> },
    { label: <span className="text-xs">1≡</span> },
    { label: <span className="text-xs">🔗</span> },
    { label: <span className="font-mono text-xs">&lt;/&gt;</span> },
  ];
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition-all">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
        {toolbarItems.map((item, i) => (
          <button
            key={i}
            className="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Outline the objectives and requirements for this assignment…"
        rows={6}
        className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none"
      />
    </div>
  );
}

function SubmissionTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SUBMISSION_TYPES.map((type) => {
        const Icon = type.icon;
        const selected = value === type.id;
        return (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all cursor-pointer"
            style={
              selected
                ? {
                    borderColor: "#5bc0be",
                    background: "rgba(91,192,190,0.08)",
                  }
                : { borderColor: "#e5e7eb", background: "white" }
            }
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={
                selected
                  ? { background: "rgba(91,192,190,0.15)" }
                  : { background: "#f3f4f6" }
              }
            >
              <Icon
                size={15}
                style={selected ? { color: "#5bc0be" } : { color: "#9ca3af" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight text-gray-700">
                {type.label}
              </p>
              <p className="text-[11px] leading-tight mt-0.5 text-gray-400">
                {type.sublabel}
              </p>
            </div>
            {selected && (
              <Check
                size={13}
                style={{ color: "#5bc0be" }}
                className="flex-shrink-0"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function AttachedFile({ file, onRemove }) {
  const isVideo = file.type?.startsWith("video/");
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 group">
      <div className="flex items-center gap-2.5 min-w-0">
        {isVideo ? (
          <Video size={15} className="text-teal-400 flex-shrink-0" />
        ) : (
          <FileText size={15} className="text-gray-400 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-400">{sizeMB} MB</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function AttachBtn({ icon: Icon, label, accept, onFiles }) {
  const inputRef = useRef(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-5 text-gray-400 hover:border-teal-300 hover:text-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer w-full"
      >
        <Icon size={20} />
        <span className="text-xs font-semibold">{label}</span>
      </button>
    </>
  );
}

function DropZone({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(files);
      }}
      className="border-2 border-dashed rounded-xl px-4 py-4 text-center text-xs font-medium transition-all cursor-pointer"
      style={
        dragging
          ? {
              borderColor: "#5bc0be",
              background: "rgba(91,192,190,0.05)",
              color: "#5bc0be",
            }
          : { borderColor: "#e5e7eb", color: "#9ca3af" }
      }
    >
      {dragging ? "Drop files here…" : "or drag & drop any files here"}
    </div>
  );
}



function StepIndicator({ steps, currentStep, onStep }) {
  return (
    <div className="flex items-center gap-1 px-6 py-4 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = currentStep === i;
        const isDone = currentStep > i;
        return (
          <div key={step.id} className="flex items-center gap-1">
            <button
              onClick={() => onStep(i)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg,#0d1b2a,#1a2e45)",
                      color: "white",
                    }
                  : isDone
                    ? { background: "rgba(91,192,190,0.12)", color: "#5bc0be" }
                    : { color: "#9ca3af" }
              }
            >
              {isDone ? (
                <Check size={13} style={{ color: "#5bc0be" }} />
              ) : (
                <Icon size={13} />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}



export default function CreateNewAssignment({
  open,
  classroomId,
  onClose,
  editingAssignment,
  onSuccess,
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    submissionType: "file",
    points: 100,
    autoCorrect: true,
  });
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  /* sync when editing */
  useEffect(() => {
    if (editingAssignment) {
      setForm({
        title: editingAssignment.title || "",
        description: editingAssignment.description || "",
        dueDate: editingAssignment.dueDate
          ? editingAssignment.dueDate.slice(0, 10)
          : "",
        submissionType: editingAssignment.submissionType || "file",
        points: editingAssignment.points ?? 100,
        autoCorrect: editingAssignment.autoCorrect ?? true,
      });
      setAttachedFiles(editingAssignment.attachedFiles || []);
    } else {
      setForm({
        title: "",
        description: "",
        dueDate: "",
        submissionType: "file",
        points: 100,
        autoCorrect: true,
      });
      setAttachedFiles([]);
    }
    setStep(0);
  }, [editingAssignment, open]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addFiles = (newFiles) =>
    setAttachedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !existing.has(f.name))];
    });

  const removeFile = (index) =>
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (asDraft = false) => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, isDraft: asDraft, classroomId };
      if (editingAssignment) {
        await assignmentService.updateAssignment(
          editingAssignment._id,
          payload,
          attachedFiles,
        );
      } else {
        await assignmentService.createAssignment(payload, attachedFiles);
      }
      onSuccess?.(); 
    } catch (error) {
      console.error("Failed to save assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;



  const StepDetails = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g., Week 4: Responsive Design Principles"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700">Description</label>
        <RichTextArea
          value={form.description}
          onChange={(v) => setField("description", v)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <Calendar size={13} className="text-gray-400" /> Due Date
        </label>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setField("dueDate", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
        />
      </div>
    </div>
  );

  const StepSettings = (
    <div className="flex flex-col gap-5">
      <div
        className="flex items-start justify-between gap-4 rounded-2xl p-5 border"
        style={{
          background: "rgba(91,192,190,0.05)",
          borderColor: "rgba(91,192,190,0.25)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(91,192,190,0.15)" }}
          >
            <Sparkles size={16} style={{ color: "#5bc0be" }} />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">
              Enable Auto Correction
            </p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-xs">
              Automatically analyzes student submissions based on your rubric
              and provides instant feedback.
            </p>
          </div>
        </div>
        <Toggle
          checked={form.autoCorrect}
          onChange={() => setField("autoCorrect", !form.autoCorrect)}
        />
      </div>


      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700">
          Submission Type
        </label>
        <SubmissionTypeSelector
          value={form.submissionType}
          onChange={(v) => setField("submissionType", v)}
        />
      </div>


      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <Star size={13} className="text-yellow-400" /> Point Value
        </label>
        <div className="relative">
          <input
            type="number"
            value={form.points}
            onChange={(e) => setField("points", Number(e.target.value))}
            min={1}
            max={1000}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
            pts
          </span>
        </div>
      </div>
    </div>
  );

  const StepMaterials = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-400">
        Attach reference files, rubrics, or video walkthroughs for students.
        {attachedFiles.length > 0 && (
          <span className="ml-2 font-semibold" style={{ color: "#5bc0be" }}>
            {attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""}{" "}
            attached
          </span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <AttachBtn
          icon={FileText}
          label="Add PDF / Doc"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          onFiles={addFiles}
        />
        <AttachBtn
          icon={Video}
          label="Add Video"
          accept="video/*"
          onFiles={addFiles}
        />
      </div>

      <DropZone onFiles={addFiles} />

      {attachedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {attachedFiles.map((file, i) => (
            <AttachedFile
              key={`${file.name}-${i}`}
              file={file}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const panels = [StepDetails, StepSettings, StepMaterials];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
      style={{ background: "rgba(15,20,40,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col my-10 ">
       
        <div
          className="px-6 pt-6 pb-5 relative overflow-hidden rounded-t-xl"
          style={{
            background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)",
          }}
        >
          <div
            className="absolute right-0 top-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#5bc0be 0%,transpare nt 70%)",
              transform: "translate(30%,-30%)",
            }}
          />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                {editingAssignment ? "Edit Assignment" : "New Assignment"}
              </span>
              <h2 className="text-white text-xl font-extrabold mt-2 leading-tight">
                {editingAssignment
                  ? editingAssignment.title || "Edit Assignment"
                  : "Create New Assignment"}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Fill in the details to set up your classroom task.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer mt-1 relative z-10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

      
        <StepIndicator steps={STEPS} currentStep={step} onStep={setStep} />

       
        <div className="flex-1 overflow-y-auto px-6 py-6">{panels[step]}</div>

       
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-10">
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer px-4 py-2.5 rounded-xl hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save as Draft"}
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((p) => p - 1)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Back
              </button>
            )}

            {isLast ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "#5bc0be" }}
              >
                <Rocket size={14} />
                {loading
                  ? "Saving…"
                  : editingAssignment
                    ? "Save Changes"
                    : "Create Assignment"}
              </button>
            ) : (
              <button
                onClick={() => setStep((p) => p + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: "#5bc0be" }}
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
