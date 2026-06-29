import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import {
  downloadAsPDF,
  formatSummaryForPDF,
  copySummaryToClipboard as copyToClipboard,
  downloadSummaryAsDocx,
} from "../../utils/pdfGenerator";



const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QUIZ_QUESTION_OPTIONS = [5, 10, 15, 20, 25];
const QUIZ_TIME_OPTIONS = [10, 15, 20, 30, 45, 60];

const SUMMARY_FORMAT_OPTIONS = [
  { value: "bullets", label: "Bullet points" },
  { value: "paragraphs", label: "Paragraphs" },
  { value: "outline", label: "Outline" },
];



const DownloadIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
    />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
    />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SparkleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
    />
  </svg>
);

const XIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const MicIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
    />
  </svg>
);

const DocumentTextIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const QuizIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
    />
  </svg>
);

const AudioIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
    />
  </svg>
);



const cleanSummaryText = (text) =>
  text
    .replace(/([a-zA-Z]) +(?=[a-zA-Z])/g, "$1")
    .replace(/[\uf000-\uffff]/g, "")
    .replace(/\n{3,}/g, "\n\n");

const formatSummaryForDisplay = (summary, format, fileName) => {
  if (!summary) return "";
  const cleaned = cleanSummaryText(summary);
  const header = `# Summary: ${fileName}\n\n`;

  switch (format) {
    case "paragraphs":
      return (
        header +
        cleaned
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => l.replace(/^[-•]\s*/, "").trim())
          .join("\n\n")
      );
    case "outline": {
      const lines = cleaned.split("\n").filter((l) => l.trim());
      return lines.reduce((acc, line, i) => {
        const clean = line.replace(/^[-•]\s*/, "").trim();
        if (clean.includes(":")) {
          const [main, ...sub] = clean.split(":");
          return (
            acc +
            `${i + 1}. ${main.trim()}\n` +
            (sub.length ? `   - ${sub.join(":").trim()}\n` : "")
          );
        }
        return acc + `${i + 1}. ${clean}\n`;
      }, header);
    }
    case "bullets":
    default:
      return (
        header +
        cleaned
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => (l.trim().startsWith("-") ? l.trim() : `- ${l.trim()}`))
          .join("\n")
      );
  }
};

const parseAIQuestions = (quizText) => {
  const questions = [];
  const letterMap = { A: 0, B: 1, C: 2, D: 3 };

  for (const block of quizText.split(/(?=Q\d+:)/)) {
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

    const answer = answerLine
      .split(":")
      .slice(1)
      .join(":")
      .trim()
      .split(/[\s\n]/)[0]
      .trim();
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
  return questions;
};



const PillButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
      active
        ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
    }`}
  >
    {children}
  </button>
);

const DropZone = ({
  file,
  isDragging,
  generating,
  onFileSelect,
  onRemove,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  fileInputRef,
  accept,
  hint,
}) => (
  <>
    <div
      role="button"
      tabIndex={0}
      aria-label="File upload area"
      onClick={() => !generating && fileInputRef.current?.click()}
      onKeyDown={(e) =>
        e.key === "Enter" && !generating && fileInputRef.current?.click()
      }
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center gap-3 min-h-40 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none
        ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent-light)]"
            : file
              ? "border-[var(--accent)] bg-[var(--accent-light)] border-solid"
              : "border-dashed border-slate-200 bg-slate-50 hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
        }
        ${generating ? "pointer-events-none opacity-60" : ""}`}
    >
      {file ? (
        <>
          <CheckCircleIcon className="w-9 h-9 text-[var(--accent)]" />
          <div className="text-center px-4">
            <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">
              {file.name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB · ready
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove file"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </>
      ) : isDragging ? (
        <>
          <UploadIcon className="w-10 h-10 text-[var(--accent)] animate-bounce" />
          <p className="text-sm font-semibold text-[var(--accent)]">
            Drop it here
          </p>
        </>
      ) : (
        <>
          <UploadIcon className="w-9 h-9 text-slate-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              Drop here or{" "}
              <span className="text-[var(--accent)] font-semibold">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{hint}</p>
          </div>
        </>
      )}
    </div>
    <input
      ref={fileInputRef}
      type="file"
      onChange={onFileSelect}
      className="hidden"
      accept={accept}
    />
  </>
);

const GenerateButton = ({
  disabled,
  generating,
  progress,
  onClick,
  label,
  accentClass,
}) => (
  <button
    disabled={disabled || generating}
    onClick={onClick}
    className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 border-none cursor-pointer text-white disabled:opacity-40 disabled:cursor-not-allowed ${accentClass}`}
  >
    {generating ? (
      <>
        <RefreshIcon className="w-4 h-4 animate-spin" />
        <span>{progress || "Generating…"}</span>
      </>
    ) : (
      <>
        <SparkleIcon className="w-4 h-4" />
        <span>{label}</span>
      </>
    )}
  </button>
);

const ResultBadge = () => (
  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-wide">
    Ready
  </span>
);



const QuizTool = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [generatedQuizId, setGeneratedQuizId] = useState(null);

  const resetResults = useCallback(() => {
    setGeneratedQuestions(null);
    setGeneratedQuizId(null);
  }, []);

  const onFileSelect = useCallback(
    (e) => {
      const selected = e.target.files?.[0];
      if (!selected) return;
      setFile(selected);
      resetResults();
    },
    [resetResults],
  );

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length > 0) setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (--dragCounter.current === 0) setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      const dropped = e.dataTransfer.files?.[0];
      if (!dropped) return;
      setFile(dropped);
      resetResults();
    },
    [resetResults],
  );

  const removeFile = useCallback(() => {
    setFile(null);
    resetResults();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resetResults]);

  const handleGenerate = useCallback(async () => {
    if (!file) return toast.error("Please upload a file first");
    setGenerating(true);
    setGeneratedQuestions(null);

    try {
      const authHeader = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      setProgress("Extracting content…");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("num_questions", numQuestions);

     
      const { data: aiData } = await axios.post(
        `${API_URL}/api/generate-quiz/extract-and-generate`,
        formData,
        { headers: authHeader },
      );

      setProgress("Parsing questions…");
      const parsed = parseAIQuestions(aiData.quiz);
      if (parsed.length === 0)
        return toast.error("Could not parse questions from document");

      setProgress("Saving quiz…");
     
      const { data: saveData } = await axios.post(
        `${API_URL}/api/quizzes/personal`,
        {
          title: `Quiz — ${file.name.replace(/\.[^.]+$/, "")}`,
          timeLimit: Number(timeLimit),
          questions: JSON.stringify(parsed),
        },
        { headers: { ...authHeader, "Content-Type": "application/json" } },
      );

      setGeneratedQuestions(parsed);
      setGeneratedQuizId(saveData.data._id);
      toast.success(`${parsed.length} questions ready!`);
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || "Something went wrong",
      );
    } finally {
      setGenerating(false);
      setProgress("");
    }
  }, [file, numQuestions, timeLimit]);

  const mcqCount = useMemo(
    () => generatedQuestions?.filter((q) => q.type === "mcq").length ?? 0,
    [generatedQuestions],
  );
  const tfCount = useMemo(
    () => generatedQuestions?.filter((q) => q.type === "truefalse").length ?? 0,
    [generatedQuestions],
  );

  return (
    <div
      className="tool-card"
      style={{
        "--accent": "#059669",
        "--accent-light": "rgba(5,150,105,0.06)",
      }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <QuizIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold  text-gray-700">
              Quiz Generator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload a doc - AI builds questions automatically
            </p>
          </div>
        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <DropZone
            file={file}
            isDragging={isDragging}
            generating={generating}
            onFileSelect={onFileSelect}
            onRemove={removeFile}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            fileInputRef={fileInputRef}
            accept=".pdf,.doc,.docx,.txt"
            hint="PDF, DOCX, TXT — up to 20MB"
          />

          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Number of questions
              </label>
              <div className="flex gap-2 flex-wrap">
                {QUIZ_QUESTION_OPTIONS.map((n) => (
                  <PillButton
                    key={n}
                    active={numQuestions === n}
                    onClick={() => setNumQuestions(n)}
                  >
                    {n}
                  </PillButton>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Time limit
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  {QUIZ_TIME_OPTIONS.map((t) => (
                    <PillButton
                      key={t}
                      active={timeLimit === t}
                      onClick={() => setTimeLimit(t)}
                    >
                      {t}m
                    </PillButton>
                  ))}
                </div>
                <span className="text-xs text-slate-400">or</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    aria-label="Custom time limit in minutes"
                    className="w-16 px-2 py-1.5 text-xs text-center font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-xs text-slate-400">min</span>
                </div>
              </div>
            </div>
          </div>

          <GenerateButton
            disabled={!file}
            generating={generating}
            progress={progress}
            onClick={handleGenerate}
            label="Generate quiz with AI"
            accentClass="bg-emerald-600 hover:bg-emerald-700"
          />
        </div>

      
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 h-full flex flex-col overflow-hidden min-h-48">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shrink-0">
              <span className="text-xs font-semibold text-slate-600">
                Preview
              </span>
              {generatedQuestions && <ResultBadge />}
            </div>

            <div className="flex flex-col justify-centr items-center  overflow-y-auto mx-auto w-full h-full">
              {!generatedQuestions && !generating && (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-8 text-center">
                  <SparkleIcon className="w-7 h-7 text-slate-200" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {file
                      ? "Click Generate to preview questions"
                      : "Upload a file to start"}
                  </p>
                </div>
              )}

              {generating && (
                <div className="flex flex-col w-fit h-full items-start justify-center  gap-3">
                  {[
                    "Extracting content",
                    "Analyzing concepts",
                    "Building questions",
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-400"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                      {step}
                    </div>
                  ))}
                  {progress && (
                    <p className="text-[11px] text-slate-300 mt-1 mx-auto">
                      {progress}
                    </p>
                  )}
                </div>
              )}

              {generatedQuestions && !generating && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: generatedQuestions.length, label: "Questions" },
                      { value: `${timeLimit}m`, label: "Time" },
                      { value: mcqCount, label: "MCQ" },
                      { value: tfCount, label: "T / F" },
                    ].map(({ value, label }) => (
                      <div
                        key={label}
                        className="bg-white rounded-xl border border-slate-100 p-2.5 flex flex-col gap-0.5"
                      >
                        <span className="text-lg font-bold text-slate-800 font-mono leading-none">
                          {value}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Sample
                    </p>
                    {generatedQuestions.slice(0, 3).map((q, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl border border-slate-100 p-2.5"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            Q{i + 1}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${q.type === "mcq" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}
                          >
                            {q.type === "mcq" ? "MCQ" : "T/F"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-2">
                          {q.text}
                        </p>
                      </div>
                    ))}
                    {generatedQuestions.length > 3 && (
                      <p className="text-[10px] text-slate-400 text-center">
                        +{generatedQuestions.length - 3} more
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      generatedQuizId &&
                      navigate(`/student/quizzes/${generatedQuizId}`)
                    }
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Go to quiz <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const SummaryTool = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const [summaryFormat, setSummaryFormat] = useState("bullets");
  const [summaryDetail] = useState("standard");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [copied, setCopied] = useState(false);

  const resetResults = useCallback(() => setGeneratedSummary(null), []);
  const SUMMARY_API_URL = import.meta.env.VITE_SUMMARY_API_URL || "";

  const onFileSelect = useCallback(
    (e) => {
      const selected = e.target.files?.[0];
      if (!selected) return;
      setFile(selected);
      resetResults();
    },
    [resetResults],
  );

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length > 0) setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (--dragCounter.current === 0) setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      const dropped = e.dataTransfer.files?.[0];
      if (!dropped) return;
      setFile(dropped);
      resetResults();
    },
    [resetResults],
  );

  const removeFile = useCallback(() => {
    setFile(null);
    resetResults();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resetResults]);

  const handleGenerate = useCallback(async () => {
    if (!file) return toast.error("Please upload a file first");

    if (!SUMMARY_API_URL) {
      return toast.error(
        "Summary API not configured. Set VITE_SUMMARY_API_URL in .env",
      );
    }

    setGenerating(true);
    setGeneratedSummary(null);
    setProgress("Processing document…");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", summaryFormat);
      formData.append("detail", summaryDetail);

      const response = await axios.post(
        `${SUMMARY_API_URL}/generate-summary`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) =>
            setProgress(
              `Uploading: ${Math.round((e.loaded * 100) / e.total)}%`,
            ),
        },
      );

      if (response.data?.success && response.data?.summary) {
        setGeneratedSummary(response.data.summary);
        toast.success("Summary ready!");
      } else {
        throw new Error(response.data?.error || "No summary in response");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to generate summary";
      toast.error(
        err.request && !err.response ? "No response from server." : msg,
      );
      setGeneratedSummary(null);
    } finally {
      setGenerating(false);
      setProgress("");
    }
  }, [file, summaryFormat, summaryDetail]);

  const formattedSummary = useMemo(
    () =>
      formatSummaryForDisplay(
        generatedSummary,
        summaryFormat,
        file?.name || "document",
      ),
    [generatedSummary, summaryFormat, file],
  );

  const handleDownload = useCallback(() => {
    if (!generatedSummary || !file) return;
    const formattedContent = formatSummaryForPDF(
      generatedSummary,
      summaryFormat,
      file.name,
    );
    const baseName = file.name.replace(/\.[^.]+$/, "");
    downloadAsPDF(formattedContent, baseName, {
      title: `Summary: ${file.name}`,
      fontSize: 10,
      lineHeight: 6,
    });
    toast.success("PDF downloaded!");
  }, [generatedSummary, file, summaryFormat]);

  const handleCopy = useCallback(async () => {
    if (!generatedSummary || !file) return;
    await copyToClipboard(generatedSummary, file.name, summaryFormat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedSummary, file, summaryFormat]);

  return (
    <div
      className="tool-card"
      style={{
        "--accent": "#2563eb",
        "--accent-light": "rgba(37,99,235,0.06)",
      }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold  text-gray-700">
              Content Summarizer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload a PDF or doc - get a clean structured summary
            </p>
          </div>
        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-5">
      
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <DropZone
            file={file}
            isDragging={isDragging}
            generating={generating}
            onFileSelect={onFileSelect}
            onRemove={removeFile}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            fileInputRef={fileInputRef}
            accept=".pdf,.doc,.docx,.txt"
            hint="PDF, DOCX, TXT — up to 20MB"
          />

          <div className="bg-slate-50 rounded-xl p-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Output format
            </label>
            <div className="flex gap-2 flex-wrap">
              {SUMMARY_FORMAT_OPTIONS.map(({ value, label }) => (
                <PillButton
                  key={value}
                  active={summaryFormat === value}
                  onClick={() => setSummaryFormat(value)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          </div>

          <GenerateButton
            disabled={!file}
            generating={generating}
            progress={progress}
            onClick={handleGenerate}
            label="Generate summary"
            accentClass="bg-blue-600 hover:bg-blue-700"
          />
        </div>

      
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 h-full flex flex-col overflow-hidden min-h-48">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shrink-0">
              <span className="text-xs font-semibold text-slate-600">
                Preview
              </span>
              <div className="flex items-center gap-1">
                {generatedSummary && (
                  <>
                    <ResultBadge />
                    <button
                      onClick={handleCopy}
                      aria-label="Copy"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
                    >
                      {copied ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <CopyIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      aria-label="Download PDF"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      aria-label="Regenerate"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <RefreshIcon className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-centr items-center  overflow-y-auto mx-auto w-full h-full">
              {!generatedSummary && !generating && (
                <div className="flex flex-col w-fit h-full items-center justify-center  gap-3">
                  <SparkleIcon className="w-7 h-7 text-slate-200" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {file
                      ? "Click Generate to see summary"
                      : "Upload a document to start"}
                  </p>
                </div>
              )}

              {generating && (
                <div className="flex flex-col w-full h-full items-center justify-center  gap-3">
                  {[
                    "Reading document",
                    "Identifying key points",
                    "Structuring output",
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-400"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                      {step}
                    </div>
                  ))}
                  {progress && (
                    <p className="text-[11px] text-slate-300 mt-1">
                      {progress}
                    </p>
                  )}
                </div>
              )}

              {generatedSummary && !generating && (
                <div className="p-3 w-full h-fit">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-medium text-slate-400 capitalize">
                      {summaryFormat}
                    </span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">
                      {generatedSummary.length.toLocaleString()} chars
                    </span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3 text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                    {formattedSummary}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const SpeechToTextTool = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const audioInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const audioDragCounter = useRef(0);
  const pdfDragCounter = useRef(0);

  const [audioLanguage, setAudioLanguage] = useState("en"); 

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("transcript");
  const [copied, setCopied] = useState(false);

  const makeHandlers = (setDragging, counter, setFile, resetFn) => ({
    onDragEnter: (e) => {
      e.preventDefault();
      e.stopPropagation();
      counter.current++;
      if (e.dataTransfer.items?.length > 0) setDragging(true);
    },
    onDragLeave: (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (--counter.current === 0) setDragging(false);
    },
    onDragOver: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      counter.current = 0;
      const f = e.dataTransfer.files?.[0];
      if (!f) return;
      setFile(f);
      if (resetFn) resetFn();
    },
  });

  const audioHandlers = makeHandlers(
    setIsDraggingAudio,
    audioDragCounter,
    setAudioFile,
    () => {
      setTranscript(null);
      setSummary(null);
    },
  );
  const pdfHandlers = makeHandlers(
    setIsDraggingPdf,
    pdfDragCounter,
    setPdfFile,
    null,
  );

  const handleGenerate = useCallback(async () => {
    if (!audioFile) return toast.error("Please upload an audio file first");
    setGenerating(true);
    setTranscript(null);
    setSummary(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("audio", audioFile);
      if (pdfFile) formData.append("pdf", pdfFile);
      formData.append("language", audioLanguage);

      setProgress("Uploading audio…");
      const { data: submitData } = await axios.post(
        `${API_URL}/api/speech-to-text/transcribe`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (e) =>
            setProgress(
              `Uploading: ${Math.round((e.loaded * 100) / e.total)}%`,
            ),
        },
      );

      if (!submitData.jobId) throw new Error("Server did not return a job ID");

      const jobId = submitData.jobId;
      let attempts = 0;
      const MAX_ATTEMPTS = 90;
      setProgress("Transcribing… this may take a few minutes");

      await new Promise((resolve, reject) => {
        const poll = async () => {
          attempts++;
          if (attempts > MAX_ATTEMPTS)
            return reject(new Error("Timed out after 12 minutes"));
          try {
            const { data: statusData } = await axios.get(
              `${API_URL}/api/speech-to-text/status/${jobId}?language=${audioLanguage}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (statusData.status === "done") {
              if (statusData.transcript) setTranscript(statusData.transcript);
              if (statusData.summary) {
                setSummary(statusData.summary);
                setActiveTab("summary");
              } else {
                setActiveTab("transcript");
              }
              toast.success("Transcription complete!");
              resolve();
            } else if (statusData.status === "error") {
              reject(new Error(statusData.error || "Transcription failed"));
            } else {
              const mins = Math.floor((attempts * 8) / 60);
              const secs = (attempts * 8) % 60;
              setProgress(
                mins > 0
                  ? `Transcribing… ${mins}m ${secs}s elapsed`
                  : `Transcribing… ${secs}s elapsed`,
              );
              setTimeout(poll, 8_000);
            }
          } catch (err) {
            reject(err);
          }
        };
        setTimeout(poll, 8_000);
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Transcription failed";
      toast.error(
        err.request && !err.response ? "No response from server." : msg,
      );
    } finally {
      setGenerating(false);
      setProgress("");
    }
  }, [audioFile, pdfFile, audioLanguage]);

 

  const handleDownloadSummary = useCallback(async () => {
    const baseName = audioFile?.name?.replace(/\.[^.]+$/, "") || "audio";

    if (downloadFormat === "docx") {
      await downloadSummaryAsDocx(summary, baseName);
    } else {
      const formatted = formatSummaryForPDF(summary, "bullets", baseName);
      downloadAsPDF(formatted, baseName, {
        title: `Summary: ${baseName}`,
        fontSize: 10,
        lineHeight: 6,
      });
    }

    setShowDownloadModal(false);
    toast.success(`Downloaded as ${downloadFormat.toUpperCase()}!`);
  }, [summary, audioFile, downloadFormat]);

  const activeContent = activeTab === "transcript" ? transcript : summary;
  const hasResult = transcript || summary;

  const handleCopy = useCallback(async () => {
    if (!activeContent) return;
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  }, [activeContent]);

  return (
    <div
      className="tool-card"
      style={{
        "--accent": "#7c3aed",
        "--accent-light": "rgba(124,58,237,0.06)",
      }}
    >
   
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <MicIcon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-700">
              Speech to Text
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transcribe audio - attach a PDF for context summary
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="bg-slate-50 rounded-xl p-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Audio language
            </label>
            <div className="flex gap-2">
              {[
                { value: "en", label: "English" },
                { value: "ar", label: "Arabic" },
              ].map(({ value, label }) => (
                <PillButton
                  key={value}
                  active={audioLanguage === value}
                  onClick={() => setAudioLanguage(value)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          </div>


          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Audio file <span className="text-red-400 ml-0.5">required</span>
            </label>
            <DropZone
              file={audioFile}
              isDragging={isDraggingAudio}
              generating={generating}
              onFileSelect={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setAudioFile(f);
                setTranscript(null);
                setSummary(null);
              }}
              onRemove={() => {
                setAudioFile(null);
                setTranscript(null);
                setSummary(null);
                if (audioInputRef.current) audioInputRef.current.value = "";
              }}
              onDragEnter={audioHandlers.onDragEnter}
              onDragLeave={audioHandlers.onDragLeave}
              onDragOver={audioHandlers.onDragOver}
              onDrop={audioHandlers.onDrop}
              fileInputRef={audioInputRef}
              accept=".mp3,.wav,.aac,.m4a,.ogg,.flac"
              hint="MP3, WAV, AAC, M4A — up to 50MB"
            />
          </div>


          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Reference PDF{" "}
              </label>
              {pdfFile && (
                <button
                  onClick={() => {
                    setPdfFile(null);
                    if (pdfInputRef.current) pdfInputRef.current.value = "";
                  }}
                  className="text-[10px] text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
            {pdfFile ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-violet-200 bg-violet-50">
                <DocumentTextIcon className="w-5 h-5 text-violet-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-violet-700 truncate">
                    {pdfFile.name}
                  </p>
                  <p className="text-[10px] text-violet-400">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircleIcon className="w-4 h-4 text-violet-500 shrink-0" />
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => !generating && pdfInputRef.current?.click()}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !generating &&
                  pdfInputRef.current?.click()
                }
                onDragEnter={pdfHandlers.onDragEnter}
                onDragLeave={pdfHandlers.onDragLeave}
                onDragOver={pdfHandlers.onDragOver}
                onDrop={pdfHandlers.onDrop}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDraggingPdf
                    ? "border-violet-400 bg-violet-50"
                    : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/40"
                } ${generating ? "pointer-events-none opacity-60" : ""}`}
              >
                <DocumentTextIcon className="w-5 h-5 text-slate-300 shrink-0" />
                <span className="text-xs text-slate-400">
                  Drop a PDF for context summary, or{" "}
                  <span className="text-violet-500 font-semibold">browse</span>
                </span>
              </div>
            )}
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPdfFile(f);
              }}
              className="hidden"
            />
          </div>

          <GenerateButton
            disabled={!audioFile}
            generating={generating}
            progress={progress}
            onClick={handleGenerate}
            label={pdfFile ? "Transcribe & summarize" : "Transcribe audio"}
            accentClass="bg-violet-600 hover:bg-violet-700"
          />
        </div>

        {/* Right: Output Preview */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 h-full flex flex-col overflow-hidden min-h-48">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center shrink-0">
              <div className="flex items-center  justify-between">
                <div className="flex gap-1">
                  {["transcript", summary ? "summary" : null]
                    .filter(Boolean)
                    .map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                          activeTab === tab
                            ? "bg-violet-100 text-violet-700"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  
                </div>

                <div className="flex items-center gap-1">
                  {hasResult && <ResultBadge />}
                  {activeContent && (
                    <button
                      onClick={handleCopy}
                      aria-label="Copy"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
                    >
                      {copied ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <CopyIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {activeTab === "summary" && summary && (
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      aria-label="Download summary"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-centr items-center  overflow-y-auto mx-auto w-full h-full">
              {!hasResult && !generating && (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-8 px-4 text-center">
                  <AudioIcon className="w-7 h-7 text-slate-200" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {audioFile
                      ? "Click Transcribe to see output"
                      : "Upload an audio file to start"}
                  </p>
                </div>
              )}

              {generating && (
                <div className="flex flex-col w-fit h-full items-start justify-center  gap-3 ">
                  {[
                    "Uploading audio",
                    "Transcribing speech",
                    
                    "Summarizing content",
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-400"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                      {step}
                    </div>
                  ))}
                  {progress && (
                    <p className="text-[11px] text-slate-300 mt-1 mx-auto">
                      {progress}
                    </p>
                  )}
                </div>
              )}

              {activeContent && !generating && (
                <div className="p-3 w-full h-fit">
                  <div className="bg-white rounded-xl border border-slate-100 p-3 text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap font-mono max-h-72 overflow-y-auto">
                    {activeContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-sm font-bold text-slate-800 mb-1">
              Download summary
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Choose a format for your structured summary
            </p>

            <div className="flex flex-col gap-3 mb-5">
              {[
                {
                  value: "pdf",
                  label: "PDF",
                  badge: "Structured",
                  desc: "Formatted with headers, bullets, and page numbers",
                  iconBg: "bg-red-50",
                  iconColor: "text-red-700",
                  icon: <DownloadIcon className="w-4 h-4" />,
                },
                {
                  value: "docx",
                  label: "Word document (.docx)",
                  desc: "Editable — open in Word, Google Docs, or Pages",
                  iconBg: "bg-blue-50",
                  iconColor: "text-blue-700",
                  icon: <DocumentTextIcon className="w-4 h-4" />,
                },
              ].map(
                ({ value, label, badge, desc, iconBg, iconColor, icon }) => (
                  <button
                    key={value}
                    onClick={() => setDownloadFormat(value)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      downloadFormat === value
                        ? "border-violet-400 bg-violet-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
                    >
                      {icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {label}
                        {badge && (
                          <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 uppercase">
                            {badge}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </button>
                ),
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadSummary}
                className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



const TOOLS = [
  {
    id: "quiz",
    label: "Quiz generator",
    icon: QuizIcon,
    color: "#059669",
    badge: "emerald",
    component: QuizTool,
  },
  {
    id: "summary",
    label: "Content summarizer",
    icon: DocumentTextIcon,
    color: "#2563eb",
    badge: "blue",
    component: SummaryTool,
  },
  {
    id: "speech",
    label: "Speech to text",
    icon: MicIcon,
    color: "#7c3aed",
    badge: "violet",
    component: SpeechToTextTool,
  },
];

const AiToolsPage = () => {
  const SUMMARY_API_URL = import.meta.env.VITE_SUMMARY_API_URL || "";
  const [activeTab, setActiveTab] = useState("quiz");
  const ActiveTool = TOOLS.find((t) => t.id === activeTab)?.component;
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 pt-8 pb-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-emerald-400 flex items-center justify-center">
              <SparkleIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              AI Studio
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold italic text-gray-600 tracking-tight leading-none">
                AI Tools
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
                Upload your documents, audio, and content, let AI do the heavy
                lifting.
              </p>
            </div>

           
            <div className="flex items-center gap-4 shrink-0">
              {[
                { label: "Tools", value: "3" },
                { label: "Formats", value: "6+" },
                { label: "Languages", value: "AR / EN" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-bold text-gray-700 leading-none">
                    {value}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          
          <div className="flex gap-1 -mb-px">
            {TOOLS.map(({ id, label, icon: Icon, color }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    active
                      ? "border-b-2 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                  }`}
                  style={active ? { borderColor: color, color } : {}}
                >
                  <Icon className="w-4 h-4" style={active ? { color } : {}} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

     
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <style>{`
          .tool-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          }
          @media (max-width: 640px) {
            .tool-card { padding: 1rem; border-radius: 16px; }
          }
        `}</style>

        {ActiveTool && <ActiveTool />}
      </div>
    </div>
  );
};

export default AiToolsPage;
