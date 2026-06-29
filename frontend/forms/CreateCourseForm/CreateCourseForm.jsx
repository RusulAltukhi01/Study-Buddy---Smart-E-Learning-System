import { useState, useRef } from "react";
import {
  Upload,
  Link2,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
  Image,
  Settings,
  CheckCircle,
  AlertCircle,
  Video,
  FileText,
  X,
} from "lucide-react";
import "./CreateCourseForm.css";

const CATEGORIES = [
  "Design",
  "Development",
  "Marketing",
  "Business",
  "Data Science",
  "Photography",
  "Music",
  "Health",
];
const SUBCATEGORIES = {
  Design: ["User Interface", "Graphic Design", "Motion", "3D"],
  Development: ["Web", "Mobile", "Backend", "DevOps"],
  Marketing: ["SEO", "Social Media", "Email", "Content"],
  Business: ["Entrepreneurship", "Management", "Finance", "Sales"],
  "Data Science": ["Machine Learning", "Analytics", "Visualization", "Python"],
  Photography: ["Portrait", "Landscape", "Editing", "Commercial"],
  Music: ["Production", "Theory", "Instruments", "Mixing"],
  Health: ["Fitness", "Nutrition", "Mental Health", "Yoga"],
};
const LANGUAGES = [
  "English (US)",
  "Arabic",
  "French",
  "Spanish",
  "German",
  "Portuguese",
  "Japanese",
  "Chinese",
];

const StepIndicator = ({ current }) => {
  const steps = [
    { n: 1, label: "Basic Info", icon: <BookOpen size={14} /> },
    { n: 2, label: "Media", icon: <Image size={14} /> },
    { n: 3, label: "Curriculum", icon: <FileText size={14} /> },
    { n: 4, label: "Settings", icon: <Settings size={14} /> },
  ];
  return (
    <div className="cf-steps">
      {steps.map((s, i) => (
        <div key={s.n} className="cf-step-wrap">
          <div
            className={`cf-step ${current === s.n ? "cf-step--active" : current > s.n ? "cf-step--done" : ""}`}
          >
            <div className="cf-step-circle">
              {current > s.n ? <CheckCircle size={14} /> : s.icon}
            </div>
            <span className="cf-step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`cf-step-line ${current > s.n + 1 ? "cf-step-line--done" : current > s.n ? "cf-step-line--active" : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

function StepBasicInfo({ data, onChange, errors = {} }) {
  const sub = SUBCATEGORIES[data.category] || [];
  return (
    <div className="cf-card">
      <div className="cf-card-header">
        <div className="cf-card-icon cf-card-icon--1">
          <BookOpen size={16} />
        </div>
        <div>
          <h2 className="cf-card-title">Step 1: Basic Information</h2>
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">Course Title</label>
        <input
          className={`cf-input ${errors.title ? "cf-input--error" : ""}`}
          placeholder="e.g. Advanced UI Design Mastery"
          maxLength={200}
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        {errors.title ? (
          <span className="cf-error">{errors.title}</span>
        ) : (
          <span className="cf-hint">
            Make it catchy and descriptive (max 200 chars)
          </span>
        )}
      </div>

      <div className="cf-field">
        <label className="cf-label">Subtitle</label>
        <input
          className="cf-input"
          placeholder="Explain what students will achieve in one sentence"
          maxLength={300}
          value={data.subtitle}
          onChange={(e) => onChange("subtitle", e.target.value)}
        />
      </div>

      <div className="cf-field">
        <label className="cf-label">Course Description</label>
        <textarea
          className={`cf-textarea ${errors.description ? "cf-input--error" : ""}`}
          rows={5}
          placeholder="Detailed curriculum breakdown, who this is for, and what they will learn..."
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
        {errors.description && (
          <span className="cf-error">{errors.description}</span>
        )}
      </div>

      <div className="cf-row-2">
        <div className="cf-field">
          <label className="cf-label">Category</label>
          <div className="cf-select-wrap">
            <select
              className={`cf-select ${errors.category ? "cf-input--error" : ""}`}
              value={data.category}
              onChange={(e) => {
                onChange("category", e.target.value);
                onChange("subcategory", "");
              }}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="cf-select-arrow" />
          </div>
          {errors.category && (
            <span className="cf-error">{errors.category}</span>
          )}
        </div>
        <div className="cf-field">
          <label className="cf-label">Subcategory</label>
          <div className="cf-select-wrap">
            <select
              className="cf-select"
              value={data.subcategory}
              onChange={(e) => onChange("subcategory", e.target.value)}
              disabled={!sub.length}
            >
              <option value="">Select subcategory</option>
              {sub.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="cf-select-arrow" />
          </div>
        </div>
      </div>

      <div className="cf-row-2">
        <div className="cf-field">
          <label className="cf-label">Level</label>
          <div className="cf-toggle-group">
            {["beginner", "intermediate", "advanced", "all"].map((l) => (
              <button
                key={l}
                className={`cf-toggle ${data.level === l ? "cf-toggle--active" : ""}`}
                onClick={() => onChange("level", l)}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="cf-field">
          <label className="cf-label">Language</label>
          <div className="cf-select-wrap">
            <select
              className="cf-select"
              value={data.language}
              onChange={(e) => onChange("language", e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <ChevronDown size={14} className="cf-select-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepMedia({ data, onChange }) {
  const fileRef = useRef();

  const handleResource = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange("resources", [
      ...data.resources,
      {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + " MB",
        url: "",
      },
    ]);
  };

  return (
    <div className="cf-card">
      <div className="cf-card-header">
        <div className="cf-card-icon cf-card-icon--2">
          <Image size={16} />
        </div>
        <h2 className="cf-card-title">Step 2: Media & Assets</h2>
      </div>

      <div className="cf-row-2">
        <div className="cf-field">
          <label className="cf-label">Course Thumbnail</label>
          <div className="cf-dropzone" onClick={() => fileRef.current?.click()}>
            {data.thumbnail ? (
              <img
                src={data.thumbnail}
                alt="thumb"
                className="cf-thumb-preview"
              />
            ) : (
              <>
                <Upload size={28} className="cf-drop-icon" />
                <p className="cf-drop-text">Click to upload thumbnail</p>
                <p className="cf-drop-hint">Recommended: 1280×720 (16:9)</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="cf-hidden"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) onChange("thumbnail", URL.createObjectURL(f));
              }}
            />
          </div>
        </div>

        <div className="cf-field">
          <label className="cf-label">Preview Video URL</label>
          <div className="cf-input-icon-wrap">
            <Link2 size={14} className="cf-input-icon" />
            <input
              className="cf-input cf-input--icon"
              placeholder="YouTube, Vimeo, or Wistia link"
              value={data.previewVideo}
              onChange={(e) => onChange("previewVideo", e.target.value)}
            />
          </div>
          <div className="cf-tip">
            <span className="cf-tip-dot" />A great intro video can increase
            enrollment rates by over 40%. Keep it under 2 minutes!
          </div>
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">General Resources</label>
        {data.resources.map((r, i) => (
          <div key={i} className="cf-resource-row">
            <FileText size={15} className="cf-resource-icon" />
            <div>
              <p className="cf-resource-name">{r.name}</p>
              <p className="cf-resource-size">{r.size}</p>
            </div>
            <button
              className="cf-resource-del"
              onClick={() =>
                onChange(
                  "resources",
                  data.resources.filter((_, j) => j !== i),
                )
              }
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          className="cf-add-resource"
          onClick={() => document.getElementById("cf-res-input").click()}
        >
          <Plus size={14} /> Add Resource (PDF, ZIP, Link)
        </button>
        <input
          id="cf-res-input"
          type="file"
          className="cf-hidden"
          onChange={handleResource}
        />
      </div>
    </div>
  );
}

function StepCurriculum({ data, onChange, errors = {} }) {
  const [openSections, setOpenSections] = useState({});

  const addSection = () => {
    const s = {
      _id: Date.now(),
      title: "",
      description: "",
      weekNumber: data.sections.length + 1,
      order: data.sections.length,
      lectures: [],
    };
    onChange("sections", [...data.sections, s]);
    setOpenSections((o) => ({ ...o, [s._id]: true }));
  };

  const updateSection = (id, key, val) =>
    onChange(
      "sections",
      data.sections.map((s) => (s._id === id ? { ...s, [key]: val } : s)),
    );
  const removeSection = (id) =>
    onChange(
      "sections",
      data.sections.filter((s) => s._id !== id),
    );

  const addLecture = (secId) => {
    const l = {
      _id: Date.now(),
      title: "",
      videoDuration: "",
      isPreview: false,
      resources: [],
      order: 0,
    };
    onChange(
      "sections",
      data.sections.map((s) =>
        s._id === secId ? { ...s, lectures: [...s.lectures, l] } : s,
      ),
    );
  };

  const updateLecture = (secId, lId, key, val) => {
    onChange(
      "sections",
      data.sections.map((s) =>
        s._id === secId
          ? {
              ...s,
              lectures: s.lectures.map((l) =>
                l._id === lId ? { ...l, [key]: val } : l,
              ),
            }
          : s,
      ),
    );
  };

  const removeLecture = (secId, lId) => {
    onChange(
      "sections",
      data.sections.map((s) =>
        s._id === secId
          ? { ...s, lectures: s.lectures.filter((l) => l._id !== lId) }
          : s,
      ),
    );
  };

  return (
    <div className="cf-card">
      <div className="cf-card-header">
        <div className="cf-card-icon cf-card-icon--3">
          <FileText size={16} />
        </div>
        <h2 className="cf-card-title">Step 3: Curriculum Builder</h2>
        <div className="cf-card-header-actions">
          <button className="cf-ghost-btn">
            <GripVertical size={14} /> Reorder
          </button>
          <button className="cf-primary-btn-sm" onClick={addSection}>
            <Plus size={14} /> Add Section
          </button>
        </div>
      </div>

      {data.sections.length === 0 && (
        <div className="cf-empty">
          <BookOpen size={32} className="cf-empty-icon" />
          <p>No sections yet. Add your first section to get started.</p>
        </div>
      )}

      {data.sections.map((sec, si) => (
        <div key={sec._id} className="cf-section-block">
          <div className="cf-section-header">
            <span className="cf-section-badge">S{si + 1}</span>

            <div className="cf-section-title-wrap">
              <input
                className={`cf-section-title-input ${errors[`sections[${si}].title`] ? "cf-input--error" : ""}`}
                placeholder="Section title..."
                value={sec.title}
                onChange={(e) =>
                  updateSection(sec._id, "title", e.target.value)
                }
              />
              {errors[`sections[${si}].title`] && (
                <span className="cf-error">
                  {errors[`sections[${si}].title`]}
                </span>
              )}
            </div>

            <div className="cf-section-meta">
              {sec.lectures.length > 0 && (
                <span className="cf-lecture-count">
                  {sec.lectures.length} Lecture
                  {sec.lectures.length > 1 ? "s" : ""}
                </span>
              )}
              <div className="cf-week-badge">
                <span className="cf-week-label">WEEK</span>
                <input
                  className="cf-week-input"
                  type="number"
                  min={1}
                  value={sec.weekNumber}
                  onChange={(e) =>
                    updateSection(sec._id, "weekNumber", +e.target.value)
                  }
                />
              </div>
              <button
                className="cf-icon-btn-sm"
                onClick={() => removeSection(sec._id)}
              >
                <Trash2 size={14} />
              </button>
              <button
                className="cf-icon-btn-sm"
                onClick={() =>
                  setOpenSections((o) => ({ ...o, [sec._id]: !o[sec._id] }))
                }
              >
                {openSections[sec._id] ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          </div>

          {errors[`sections[${si}].lectures`] && (
            <span className="cf-error cf-error--section">
              {errors[`sections[${si}].lectures`]}
            </span>
          )}

          {openSections[sec._id] && (
            <div className="cf-lectures">
              {sec.lectures.map((lec, li) => (
                <div key={lec._id} className="cf-lecture-row">
                  <GripVertical size={14} className="cf-drag" />
                  <span className="cf-lec-num">{li + 1}</span>

                  <div className="cf-lec-input-wrap">
                    <input
                      className={`cf-input cf-lec-input ${errors[`sections[${si}].lectures[${li}].title`] ? "cf-input--error" : ""}`}
                      placeholder="Lecture title..."
                      value={lec.title}
                      onChange={(e) =>
                        updateLecture(sec._id, lec._id, "title", e.target.value)
                      }
                    />
                    {errors[`sections[${si}].lectures[${li}].title`] && (
                      <span className="cf-error">
                        {errors[`sections[${si}].lectures[${li}].title`]}
                      </span>
                    )}
                  </div>

                  <div className="cf-lec-meta">
                    <Video size={12} />
                    <input
                      className="cf-lec-dur"
                      type="number"
                      placeholder="min"
                      min={0}
                      value={lec.videoDuration}
                      onChange={(e) =>
                        updateLecture(
                          sec._id,
                          lec._id,
                          "videoDuration",
                          e.target.value,
                        )
                      }
                    />
                    <span className="cf-lec-res">
                      • {lec.resources.length} Resource
                      {lec.resources.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="cf-lec-actions">
                    <button className="cf-icon-btn-sm">
                      <FileText size={13} />
                    </button>
                    <button
                      className="cf-icon-btn-sm"
                      onClick={() => removeLecture(sec._id, lec._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="cf-add-lecture"
                onClick={() => addLecture(sec._id)}
              >
                <Plus size={13} /> Add Lecture to this Section
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StepSettings({ data, onChange }) {
  const [outcomeInput, setOutcomeInput] = useState("");

  const addOutcome = () => {
    if (!outcomeInput.trim()) return;
    onChange("learningOutcomes", [
      ...data.learningOutcomes,
      outcomeInput.trim(),
    ]);
    setOutcomeInput("");
  };

  return (
    <div className="cf-card">
      <div className="cf-card-header">
        <div className="cf-card-icon cf-card-icon--4">
          <Settings size={16} />
        </div>
        <h2 className="cf-card-title">Step 4: Outcomes & Settings</h2>
      </div>

      <div className="cf-field">
        <label className="cf-label">What will students learn?</label>
        <div className="cf-outcomes">
          {data.learningOutcomes.map((o, i) => (
            <div key={i} className="cf-outcome-tag">
              {o}
              <button
                onClick={() =>
                  onChange(
                    "learningOutcomes",
                    data.learningOutcomes.filter((_, j) => j !== i),
                  )
                }
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <input
            className="cf-input"
            placeholder="e.g. Building responsive components"
            value={outcomeInput}
            onChange={(e) => setOutcomeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOutcome()}
          />
        </div>
        <button className="cf-link-btn" onClick={addOutcome}>
          <Plus size={13} /> Add learning outcome
        </button>
      </div>

      <div className="cf-row-2">
        <div className="cf-field">
          <label className="cf-label">Target Audience</label>
          <textarea
            className="cf-textarea"
            rows={3}
            placeholder="Who is this course for?"
            value={data.targetAudience}
            onChange={(e) => onChange("targetAudience", e.target.value)}
          />
        </div>
        <div className="cf-field">
          <label className="cf-label">Prerequisites</label>
          <textarea
            className="cf-textarea"
            rows={3}
            placeholder="What knowledge should they have before starting?"
            value={data.prerequisites}
            onChange={(e) => onChange("prerequisites", e.target.value)}
          />
        </div>
      </div>

      <div className="cf-toggles-row">
        {[
          { key: "providesCertificate", label: "Provides Certificate" },
          { key: "allowLateAccess", label: "Auto-Enrolling" },
          { key: "showInstructorProfile", label: "Show Instructor Profile" },
        ].map(({ key, label }) => (
          <div key={key} className="cf-toggle-item">
            <button
              className={`cf-switch ${data[key] ? "cf-switch--on" : ""}`}
              onClick={() => onChange(key, !data[key])}
            >
              <div className="cf-switch-thumb" />
            </button>
            <span className="cf-toggle-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const initialData = {
  title: "Advanced UI Design Mastery Course",
  subtitle: "Master modern UI design principles and build stunning interfaces",
  description: "In this comprehensive course, you will learn everything you need to know about modern UI design. From color theory and typography to advanced component design and design systems. This course is perfect for both beginners and intermediate designers looking to level up their skills.",
  category: "Design",
  subcategory: "User Interface",
  level: "intermediate",
  language: "English (US)",
  thumbnail: "",
  previewVideo: "",
  resources: [],
  sections: [
    {
      _id: 1,
      title: "Getting Started with UI Design",
      description: "",
      weekNumber: 1,
      order: 0,
      lectures: [
        { _id: 11, title: "Introduction to UI Design", videoDuration: 15, isPreview: true, resources: [], order: 0 },
        { _id: 12, title: "Setting Up Your Design Tools", videoDuration: 20, isPreview: false, resources: [], order: 1 },
      ],
    },
    {
      _id: 2,
      title: "Color Theory and Typography",
      description: "",
      weekNumber: 2,
      order: 1,
      lectures: [
        { _id: 21, title: "Understanding Color Theory", videoDuration: 25, isPreview: false, resources: [], order: 0 },
        { _id: 22, title: "Typography Fundamentals", videoDuration: 18, isPreview: false, resources: [], order: 1 },
      ],
    },
  ],
  learningOutcomes: [
    "Build professional UI components from scratch",
    "Apply color theory and typography in real projects",
    "Create and maintain a design system",
  ],
  targetAudience: "Beginner to intermediate designers\nDevelopers who want to improve their design skills",
  prerequisites: "Basic computer skills\nFamiliarity with any design tool is a plus",
  providesCertificate: true,
  allowLateAccess: true,
  showInstructorProfile: true,
};

export default function CreateCourseForm({
  onSaveDraft,
  onPublish,
  submitting,
  fieldErrors = {},
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);

  const onChange = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="cf-root">
      <div className="cf-topbar">
        <div className="cf-topbar-brand">
          <div className="cf-brand-icon">
            <BookOpen size={16} />
          </div>
          <div>
            <p className="cf-brand-title">Course Creator</p>
            <p className="cf-brand-sub">Instructor Studio v2.4</p>
          </div>
        </div>
        <nav className="cf-topbar-nav">
          <a className="cf-nav-link">Dashboard</a>
          <a className="cf-nav-link cf-nav-link--active">My Courses</a>
          <a className="cf-nav-link">Analytics</a>
        </nav>
        <div className="cf-topbar-actions">
          <button className="cf-ghost-btn" onClick={() => onSaveDraft?.(data)}>
            Save Draft
          </button>

        </div>
      </div>

      <div className="cf-body">
        <StepIndicator current={step} />

        <div className="cf-form-header">
          <h1 className="cf-form-title">Create New Curriculum</h1>
          <p className="cf-form-sub">
            Fill in the details to set up your professional course structure.
          </p>
        </div>

        {step === 1 && (
          <StepBasicInfo data={data} onChange={onChange} errors={fieldErrors} />
        )}
        {step === 2 && (
          <StepMedia data={data} onChange={onChange} errors={fieldErrors} />
        )}
        {step === 3 && (
          <StepCurriculum
            data={data}
            onChange={onChange}
            errors={fieldErrors}
          />
        )}
        {step === 4 && (
          <StepSettings data={data} onChange={onChange} errors={fieldErrors} />
        )}

        <div className="cf-footer">
          <button
            className="cf-ghost-btn cf-back-btn"
            onClick={handlePrev}
            disabled={step === 1}
          >
            ← Previous Step
          </button>
          <div className="cf-footer-right">
            <button className="cf-ghost-btn">Preview</button>
            {step < 4 ? (
              <button className="cf-publish-btn" onClick={handleNext}>
                Next Step →
              </button>
            ) : (
              <button
                className="cf-publish-btn"
                disabled={submitting}
                onClick={() => onPublish?.(data)}
              >
                {submitting ? "Publishing..." : "Publish Course"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


