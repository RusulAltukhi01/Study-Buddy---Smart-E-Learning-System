import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Image,
  Trash2,
  Loader2,
  Sparkles,
  Clock,
  Settings2,
  ChevronDown,
  ToggleLeft,
  List,
  CheckCircle2,
  X,
  CalendarClock,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import "./CreateQuizForm.css";
import quizService from "../../src/services/quizService";

const API_URL = "http://localhost:5000";
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const emptyMCQ = () => ({
  type: "mcq",
  text: "",
  options: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  hint: "",
  points: 1,
});

const emptyTF = () => ({
  type: "truefalse",
  text: "",
  options: [
    { text: "True", isCorrect: false },
    { text: "False", isCorrect: false },
  ],
  hint: "",
  points: 1,
});
function parseAIQuestions(quizText) {
  const questions = [];
  const blocks = quizText.split(/(?=Q\d+:)/);

  for (const block of blocks) {
    const lines = block.trim().split("\n").filter(Boolean);
    if (lines.length < 2) continue;

    const firstLine = lines[0];
    if (!firstLine.match(/^Q\d+:/)) continue;

    const questionText = firstLine.replace(/^Q\d+:\s*/, "").trim();
    if (!questionText) continue;

    const answerLine = lines.find((l) =>
      l.trim().toLowerCase().startsWith("answer:"),
    );
    if (!answerLine) continue;

    const answerRaw = answerLine.split(":").slice(1).join(":").trim();
    const answer = answerRaw.split(/[\s\n]/)[0].trim();
    if (!answer) continue;

    const optionLines = lines.filter((l) => /^[A-D][)]\s/.test(l.trim()));

    if (answer === "True" || answer === "False") {
      questions.push({
        type: "truefalse",
        text: questionText,
        options: [
          { text: "True", isCorrect: answer === "True" },
          { text: "False", isCorrect: answer === "False" },
        ],
        hint: "",
        points: 1,
      });
    } else if (optionLines.length >= 2 && answer.match(/^[A-D]$/)) {
      const letterMap = { A: 0, B: 1, C: 2, D: 3 };
      const correctIndex = letterMap[answer.toUpperCase()] ?? 0;
      questions.push({
        type: "mcq",
        text: questionText,
        options: optionLines.map((opt, i) => ({
          text: opt.replace(/^[A-D][)]\s*/, "").trim(),
          isCorrect: i === correctIndex,
        })),
        hint: "",
        points: 1,
      });
    } else if (lines.some((l) => /^Statement\s+\d+/i.test(l.trim()))) {
      questions.push({
        type: "truefalse",
        text: questionText,
        options: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
        hint: "",
        points: 1,
      });

      // any other answer format → convert to True/False
    } else {
      questions.push({
        type: "truefalse",
        text: questionText,
        options: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
        hint: "",
        points: 1,
      });
    }
  }

  console.log(`Parsed ${questions.length} questions from AI response`);
  return questions;
}

const CreateQuizForm = ({
  onClose,
  onSuccess,
  classroomId = null,
  courseId = null,
  classrooms = [],
  editingQuiz = null,
  questions: preGeneratedQuestions = null,
  title: preFilledTitle = "",
}) => {
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([emptyMCQ()]);

  const [numQuestions, setNumQuestions] = useState(15);
  const [form, setForm] = useState({
    title: "",
    selectedClassroomId: classroomId || "",
    timeLimit: 60,
    maxAttempts: 1,
    startDate: "",
    dueDate: "",
    shuffle: false,
  });

  useEffect(() => {
    if (editingQuiz) {
      setForm({
        title: editingQuiz.title || "",
        selectedClassroomId:
          editingQuiz.classroom?._id || editingQuiz.classroomId || "",
        timeLimit: editingQuiz.timeLimit || 60,
        maxAttempts: editingQuiz.maxAttempts || 1,
        startDate: editingQuiz.startDate
          ? new Date(editingQuiz.startDate).toISOString().slice(0, 16)
          : "",
        dueDate: editingQuiz.dueDate
          ? new Date(editingQuiz.dueDate).toISOString().slice(0, 16)
          : "",
        shuffle: editingQuiz.shuffle || false,
      });
      if (editingQuiz.questions?.length > 0) {
        setQuestions(
          editingQuiz.questions.map((q) => ({
            _id: q._id,
            type: q.type,
            text: q.text,
            options: q.options,
            hint: q.hint || "",
            points: q.points || 1,
          })),
        );
      }
    }
  }, [editingQuiz]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => ACCEPTED.includes(f.type));
    if (valid.length !== incoming.length)
      toast.warning("Only PDF and image files accepted");
    setFiles((p) => [...p, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const addQuestion = (type) =>
    setQuestions((p) => [...p, type === "mcq" ? emptyMCQ() : emptyTF()]);
  const removeQuestion = (qi) => {
    if (questions.length > 1) setQuestions((p) => p.filter((_, i) => i !== qi));
  };
  const updateQuestion = (qi, key, value) =>
    setQuestions((p) =>
      p.map((q, i) => (i === qi ? { ...q, [key]: value } : q)),
    );
  const updateOption = (qi, oi, key, value) =>
    setQuestions((p) =>
      p.map((q, i) => {
        if (i !== qi) return q;
        return {
          ...q,
          options: q.options.map((o, j) =>
            j === oi ? { ...o, [key]: value } : o,
          ),
        };
      }),
    );
  const setCorrect = (qi, oi) =>
    setQuestions((p) =>
      p.map((q, i) => {
        if (i !== qi) return q;
        return {
          ...q,
          options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })),
        };
      }),
    );

  const handleGenerate = async () => {
    if (files.length === 0) {
      toast.error("Upload a PDF file first");
      return;
    }
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("num_questions", numQuestions);

      const response = await fetch(
        `${API_URL}/api/generate-quiz/extract-and-generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Server response:", text);
        throw new Error("Server error: " + response.status);
      }

      const data = await response.json();
      if (!data.success) {
        toast.error("Failed to generate questions");
        return;
      }

      const parsed = parseAIQuestions(data.quiz);
      if (parsed.length === 0) {
        toast.warning("Couldn't parse questions, try again");
        return;
      }

      setQuestions(parsed);
      toast.success(` ${parsed.length} questions generated!`);
    } catch (err) {
      console.error(err);
      toast.error("AI service error. Make sure Kaggle notebook is running.");
    } finally {
      setGenerating(false);
    }
  };

  // const handleGenerate = async () => {
  //   if (files.length === 0) { toast.error("Upload files first"); return; }
  //   setGenerating(true);
  //   await new Promise((r) => setTimeout(r, 1800));
  //   setQuestions([
  //     { type: "mcq", text: "Which data structure uses LIFO order?", options: [{ text: "Queue", isCorrect: false }, { text: "Stack", isCorrect: true }, { text: "Linked List", isCorrect: false }, { text: "Tree", isCorrect: false }], hint: "Think about a stack of plates.", points: 1 },
  //     { type: "truefalse", text: "RAM is a type of non-volatile memory.", options: [{ text: "True", isCorrect: false }, { text: "False", isCorrect: true }], hint: "RAM loses data when power is off.", points: 1 },
  //     { type: "mcq", text: "What does CPU stand for?", options: [{ text: "Central Processing Unit", isCorrect: true }, { text: "Computer Personal Unit", isCorrect: false }, { text: "Central Program Utility", isCorrect: false }, { text: "Core Processing Utility", isCorrect: false }], hint: "The brain of the computer.", points: 1 },
  //   ]);
  //   setGenerating(false);
  //   toast.success("Questions generated!");
  // };

  const handleSubmit = async (status) => {
    if (!form.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    if (questions.some((q) => !q.text.trim())) {
      toast.error("All questions need text");
      return;
    }
    if (
      form.startDate &&
      form.dueDate &&
      new Date(form.startDate) >= new Date(form.dueDate)
    ) {
      toast.error("Start time must be before due date");
      return;
    }

    setSubmitting(true);
    
    try {
      let res;

      if (editingQuiz) {
        const payload = {
          title: form.title,
          timeLimit: form.timeLimit,
          maxAttempts: form.maxAttempts,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          status,
          classroomId: form.selectedClassroomId || classroomId || undefined,
          courseId: courseId || undefined,
          questions: questions,
        };
        res = await quizService.updateQuiz(editingQuiz._id, payload);
      } else {
        const toUTC = (localStr) =>
          localStr ? new Date(localStr).toISOString() : undefined;

        const payload = {
          title: form.title,
          timeLimit: form.timeLimit,
          maxAttempts: form.maxAttempts,
          startDate: toUTC(form.startDate),
          dueDate: toUTC(form.dueDate),
          status,
          classroomId: form.selectedClassroomId || classroomId || undefined,
          courseId: courseId || undefined,
          questionCount: questions.length,
          questions: JSON.stringify(questions),
        };
        res = await quizService.createQuiz(payload, files);
      }

      onSuccess?.(res.data);
      onClose?.();
      // toast.success(editingQuiz ? "Quiz updated!" : "Quiz created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save quiz");
    } finally {
      setSubmitting(false);
    }
  };
  const estimatedDuration = Math.max(
    questions.length * 2,
    Math.ceil(questions.length * 1.5),
  );

  return (
    <div className="cqf-page">
      <div className="cqf-topbar">
        <div className="cqf-breadcrumb">
          <span>QUIZZES</span>
          <span className="cqf-bc-sep">›</span>
          <span className="cqf-bc-active">CREATE NEW</span>
        </div>
        <div className="cqf-title-row">
          <div>
            <h1 className="cqf-heading">
              {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
            </h1>
            <p className="cqf-subheading">
              Design an assessment to test your students' knowledge.
            </p>
          </div>
          <div className="cqf-top-actions">
            {onClose && (
              <button onClick={onClose} className="cqf-btn-ghost">
                <X size={15} /> Cancel
              </button>
            )}
            <button
              onClick={() => handleSubmit("draft")}
              disabled={submitting}
              className="cqf-btn-save"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={submitting}
              className="cqf-btn-publish"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Publish Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="cqf-layout">
        <aside className="cqf-sidebar">
          <div className="cqf-config-card">
            <div className="cqf-config-title">
              <Settings2 size={16} className="cqf-config-icon" />
              Quiz Configuration
            </div>

            <div className="cqf-field">
              <label className="cqf-label">Quiz Title</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Advanced Calculus Midterm"
                className="cqf-input"
              />
            </div>

            {classrooms.length > 0 && (
              <div className="cqf-field">
                <label className="cqf-label">Select Classroom</label>
                <div className="cqf-select-wrap">
                  <select
                    value={form.selectedClassroomId}
                    onChange={(e) => set("selectedClassroomId", e.target.value)}
                    className="cqf-select"
                  >
                    <option value="">No classroom</option>
                    {classrooms.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="cqf-select-chevron" />
                </div>
              </div>
            )}

            <div className="cqf-field">
              <label className="cqf-label">Questions to Generate</label>
              <input
                type="number"
                min={1}
                max={15}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="cqf-input"
              />
            </div>

            <div className="cqf-field">
              <label className="cqf-label">Time Limit (minutes)</label>
              <div className="cqf-input-icon-wrap">
                <Clock size={13} className="cqf-input-prefix-icon" />
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={form.timeLimit}
                  onChange={(e) => set("timeLimit", e.target.value)}
                  className="cqf-input cqf-input--prefixed"
                />
              </div>
            </div>

            <div className="cqf-field">
              <label className="cqf-label">Max Attempts</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxAttempts}
                onChange={(e) => set("maxAttempts", e.target.value)}
                className="cqf-input"
              />
            </div>

            <div className="cqf-schedule-divider">
              <CalendarClock size={13} />
              Scheduling
            </div>

            <div className="cqf-field">
              <label className="cqf-label">
                Start Date & Time
                <span className="cqf-label-hint">
                  Quiz locks until this time
                </span>
              </label>
              <div className="cqf-input-icon-wrap">
                <CalendarClock size={13} className="cqf-input-prefix-icon" />
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="cqf-input cqf-input--prefixed"
                />
              </div>
              {!form.startDate && (
                <p className="cqf-field-hint">
                  Leave empty to open immediately when published
                </p>
              )}
            </div>

            <div className="cqf-field">
              <label className="cqf-label">
                Due Date & Time
                <span className="cqf-label-hint">Quiz closes after this</span>
              </label>
              <div className="cqf-input-icon-wrap">
                <Calendar size={13} className="cqf-input-prefix-icon" />
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                  className="cqf-input cqf-input--prefixed"
                />
              </div>
            </div>

            <label className="cqf-checkbox-row">
              <input
                type="checkbox"
                checked={form.shuffle}
                onChange={(e) => set("shuffle", e.target.checked)}
                className="cqf-checkbox"
              />
              <span className="cqf-checkbox-text">
                Shuffle questions for students
              </span>
            </label>
          </div>

          <div
            className={`cqf-upload-zone ${dragging ? "cqf-upload-zone--over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} className="cqf-upload-icon" />
            <p className="cqf-upload-main">Drop files or click to upload</p>
            <p className="cqf-upload-hint">PDF, JPG, PNG, WebP · max 50MB</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="cqf-filelist">
              {files.map((f, i) => (
                <div key={i} className="cqf-file-item">
                  {f.type === "application/pdf" ? (
                    <FileText size={13} className="text-red-400" />
                  ) : (
                    <Image size={13} className="text-blue-400" />
                  )}
                  <span className="cqf-file-name">{f.name}</span>
                  <span className="cqf-file-size">{formatSize(f.size)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="cqf-file-del"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || files.length === 0}
            className="cqf-btn-generate cursor-pointer"
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {generating ? "Generating..." : "Generate Questions with AI"}
          </button>

          <div className="cqf-summary-card">
            <p className="cqf-summary-heading">QUIZ SUMMARY</p>
            <div className="cqf-summary-row">
              <span>Total Questions</span>
              <span className="cqf-summary-val">{questions.length}</span>
            </div>
            <div className="cqf-summary-row">
              <span>Estimated Duration</span>
              <span className="cqf-summary-val">{estimatedDuration} mins</span>
            </div>
            <div className="cqf-summary-row">
              <span>Time Limit</span>
              <span className="cqf-summary-val">{form.timeLimit} mins</span>
            </div>
            {form.startDate && (
              <div className="cqf-summary-row">
                <span>Opens at</span>
                <span className="cqf-summary-val cqf-summary-val--teal">
                  {new Date(form.startDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {form.dueDate && (
              <div className="cqf-summary-row">
                <span>Closes at</span>
                <span className="cqf-summary-val cqf-summary-val--red">
                  {new Date(form.dueDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </aside>

        <main className="cqf-questions-area">
          {questions.map((q, qi) => (
            <div key={qi} className="cqf-q-card">
              <div className="cqf-q-top">
                <div className="cqf-q-num">{qi + 1}</div>
                <div className="cqf-q-body">
                  <span className="cqf-q-type-label">
                    QUESTION TYPE:{" "}
                    {q.type === "mcq" ? "MULTIPLE CHOICE" : "TRUE / FALSE"}
                  </span>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                    placeholder="Enter your question text here..."
                    className="cqf-q-textarea"
                    rows={2}
                  />
                </div>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qi)}
                    className="cqf-q-delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <hr className="cqf-q-divider" />

              {q.type === "mcq" ? (
                <div className="cqf-mcq-options">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`cqf-mcq-option ${opt.isCorrect ? "cqf-mcq-option--selected" : ""}`}
                    >
                      <button
                        onClick={() => setCorrect(qi, oi)}
                        className={`cqf-radio ${opt.isCorrect ? "cqf-radio--on" : ""}`}
                      >
                        {opt.isCorrect && <span className="cqf-radio-dot" />}
                      </button>
                      <input
                        value={opt.text}
                        onChange={(e) =>
                          updateOption(qi, oi, "text", e.target.value)
                        }
                        placeholder={`Option ${oi + 1}`}
                        className="cqf-option-text-input"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cqf-mcq-options">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`cqf-mcq-option ${opt.isCorrect ? "cqf-mcq-option--selected" : ""}`}
                    >
                      <button
                        onClick={() => setCorrect(qi, oi)}
                        className={`cqf-radio ${opt.isCorrect ? "cqf-radio--on" : ""}`}
                      >
                        {opt.isCorrect && <span className="cqf-radio-dot" />}
                      </button>
                      <input
                        value={opt.text}
                        onChange={(e) =>
                          updateOption(qi, oi, "text", e.target.value)
                        }
                        placeholder={`Option ${oi + 1}`}
                        className="cqf-option-text-input"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="cqf-hint-row">
                <input
                  value={q.hint}
                  onChange={(e) => updateQuestion(qi, "hint", e.target.value)}
                  placeholder="💡 Add a hint for students (optional)..."
                  className="cqf-hint-input"
                />
              </div>
            </div>
          ))}

          <div className="cqf-add-row">
            <span className="cqf-add-label">Add New Question:</span>
            <button onClick={() => addQuestion("mcq")} className="cqf-add-btn">
              <List size={14} /> Multiple Choice
            </button>
            <button
              onClick={() => addQuestion("truefalse")}
              className="cqf-add-btn"
            >
              <ToggleLeft size={14} /> True / False
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateQuizForm;
