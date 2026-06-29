import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  RotateCcw,
  ArrowLeft,
  Lock,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import quizService from "../../services/quizService";
import { toast } from "sonner";
import "./QuizPage.css";

function formatCountdown(ms) {
  if (ms <= 0) return { str: "00:00:00", parts: { d: 0, h: 0, m: 0, s: 0 } };
  const totalSecs = Math.floor(ms / 1000);
  const d = Math.floor(totalSecs / 86400);
  const h = Math.floor((totalSecs % 86400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, "0");
  const str =
    d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s)}`;
  return { str, parts: { d, h, m, s } };
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const LockedState = ({ quiz, msUntilStart, isClose }) => {
  const { parts } = formatCountdown(msUntilStart);
  const openDate = formatDateTime(quiz.startDate);

  return (
    <div className="qp-locked-page">
      <div className="qp-locked-card">
        <div className="qp-locked-icon-wrap">
          <div className="qp-locked-icon-ring">
            <Lock size={28} className="qp-locked-icon" />
          </div>
        </div>

        <div className="qp-locked-labels">
          <span className="qp-locked-badge">
            <CalendarClock size={13} />
            Scheduled Quiz
          </span>
          <h1 className="qp-locked-title">{quiz.title}</h1>
          {quiz.description && (
            <p className="qp-locked-desc">{quiz.description}</p>
          )}
        </div>

        <div className="qp-locked-date-card">
          <p className="qp-locked-date-label">Quiz opens on</p>
          <p className="qp-locked-date-val">{openDate}</p>
        </div>

        {isClose && (
          <>
            <div className="qp-locked-divider" />
            <div>
              <p className="qp-locked-countdown-label">Opens in</p>
              <div className="qp-locked-countdown">
                {[
                  { val: parts.d, label: "Days", show: parts.d > 0 },
                  { val: parts.h, label: "Hours", show: true },
                  { val: parts.m, label: "Minutes", show: true },
                  { val: parts.s, label: "Seconds", show: true },
                ]
                  .filter((p) => p.show || parts.d === 0)
                  .map((p) => (
                    <div key={p.label} className="qp-countdown-unit">
                      <span className="qp-countdown-val">
                        {String(p.val).padStart(2, "0")}
                      </span>
                      <span className="qp-countdown-label">{p.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        <div className="qp-locked-meta">
          {[
            { label: "Questions", value: quiz.questions?.length || "—" },
            { label: "Time Limit", value: `${quiz.timeLimit}m` },
            { label: "Max Attempts", value: quiz.maxAttempts },
          ].map((item) => (
            <div key={item.label} className="qp-locked-meta-item">
              <span className="qp-locked-meta-val">{item.value}</span>
              <span className="qp-locked-meta-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LobbyState = ({ quiz, onStart }) => (
  <div className="qp-lobby-page">
    <div className="qp-lobby-card">
      <div className="qp-lobby-trophy">
        <Trophy size={36} className="text-(--royal-blue)" />
      </div>
      <div>
        <p className="qp-lobby-context">
          {quiz.classroom?.name || quiz.course?.title || "Quiz"}
        </p>
        <h1 className="qp-lobby-title">{quiz.title}</h1>
        {quiz.description && (
          <p className="qp-lobby-desc">{quiz.description}</p>
        )}
      </div>

      <div className="qp-lobby-stats">
        {[
          { label: "Questions", value: quiz.questions.length },
          { label: "Time Limit", value: `${quiz.timeLimit}m` },
          { label: "Attempts Left", value: quiz.maxAttempts },
        ].map((item) => (
          <div key={item.label} className="qp-lobby-stat">
            <p className="qp-lobby-stat-val">{item.value}</p>
            <p className="qp-lobby-stat-label">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="qp-lobby-rules">
        <p className="qp-lobby-rules-title">Before you begin:</p>
        <p>• Timer starts immediately when you click Start</p>
        <p>• You can navigate between questions freely</p>
        <p>• Quiz submits automatically when time runs out</p>
        <p>• Results are shown immediately after submission</p>
      </div>

      <button onClick={onStart} className="qp-start-btn">
        Start Quiz
      </button>
    </div>
  </div>
);

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("loading"); // loading | locked | lobby | active | result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hintsShown, setHintsShown] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [msUntilStart, setMsUntilStart] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const startTimeRef = useRef(null);
  const quizTimerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        // console.log("1. Quiz ID from URL:", quizId);
        // console.log("2. Token exists:", !!localStorage.getItem("token"));

        const res = await quizService.getQuizById(quizId);

        // console.log("3. Response status:", res);
        // console.log("4. Response data:", res.data);
        // console.log("5. Quiz object:", res.data);

        if (!res.data) {
          console.error("No quiz data in response");
          toast.error("Quiz not found");
          navigate(-1);
          return;
        }

        const q = res.data;
        // console.log("6. Quiz title:", q.title);
        // console.log("7. Quiz isPersonal:", q.isPersonal);
        // console.log("8. Questions count:", q.questions?.length);

        setQuiz(q);

        if (q.hasSubmitted === true) {
          // console.log("Quiz already submitted");
          setPhase("submitted");
          return;
        }

        if (q.startDate && new Date(q.startDate) > new Date()) {
          const ms = new Date(q.startDate) - new Date();
          setMsUntilStart(ms);
          setPhase("locked");
        } else {
          console.log("Quiz is ready, setting lobby phase");
          setPhase("lobby");
        }
      } catch (error) {
        // console.error("Error object:", error);
        // console.error("Error response:", error.response);
        // console.error("Error data:", error.response?.data);
        // console.error("Error status:", error.response?.status);
        toast.error(error.response?.data?.error || "Failed to load quiz");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, navigate]);

  useEffect(() => {
    if (phase !== "locked") return;
    countdownRef.current = setInterval(() => {
      const ms = new Date(quiz.startDate) - new Date();
      if (ms <= 0) {
        clearInterval(countdownRef.current);
        setMsUntilStart(0);
        setPhase("lobby");
        toast.success("Quiz is now open! You can start.");
      } else {
        setMsUntilStart(ms);
      }
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [phase, quiz]);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting) return;
      setSubmitting(true);
      clearInterval(quizTimerRef.current);

      const timeTaken = startTimeRef.current
        ? Math.round((Date.now() - startTimeRef.current) / 1000)
        : quiz?.timeLimit * 60;

      const answersArray = Object.entries(answers).map(([qi, si]) => ({
        questionIndex: parseInt(qi),
        selectedOption: si,
      }));

      try {
        const res = await quizService.submitQuiz(
          quizId,
          answersArray,
          timeTaken,
        );
        setResult(res.data);
        setPhase("result");
        if (auto) toast.info("Time's up! Quiz submitted automatically.");
      } catch (err) {
        toast.error(err?.error || "Failed to submit quiz");
        setSubmitting(false);
      }
    },
    [quizId, answers, quiz, submitting],
  );

  useEffect(() => {
    if (phase !== "active" || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    quizTimerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(quizTimerRef.current);
  }, [phase, timeLeft, handleSubmit]);

  const startQuiz = () => {
    startTimeRef.current = Date.now();
    setTimeLeft(quiz.timeLimit * 60);
    setPhase("active");
  };

  const selectAnswer = (oi) => {
    if (phase !== "active") return;
    setAnswers((p) => ({ ...p, [currentIndex]: oi }));
  };

  const toggleHint = () =>
    setHintsShown((p) => ({ ...p, [currentIndex]: !p[currentIndex] }));

  const progressPct = quiz
    ? ((currentIndex + 1) / quiz.questions.length) * 100
    : 0;
  const answeredCount = Object.keys(answers).length;
  const isLast = quiz && currentIndex === quiz.questions.length - 1;
  const timeCritical = timeLeft !== null && timeLeft < 60;
  const isClose = msUntilStart !== null && msUntilStart < 24 * 60 * 60 * 1000;

  const getPaginationRange = () => {
    const total = quiz?.questions?.length;
    const current = currentIndex;
    const delta = 2; // Number of items to show on each side

    const range = [];
    const rangeWithEllipsis = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i, index) => {
      if (range[index + 1] - i > 1) {
        rangeWithEllipsis.push(i);
        rangeWithEllipsis.push("...");
      } else {
        rangeWithEllipsis.push(i);
      }
    });

    return rangeWithEllipsis;
  };

  const paginationItems = getPaginationRange();

  if (loading || phase === "loading") {
    return (
      <div className="qp-loading">
        <div className="qp-spinner" />
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) return null;

  if (phase === "locked") {
    return (
      <LockedState quiz={quiz} msUntilStart={msUntilStart} isClose={isClose} />
    );
  }

  if (phase === "lobby") {
    return <LobbyState quiz={quiz} onStart={startQuiz} />;
  }

  if (phase === "result") {
    return (
      <QuizResults
        quiz={quiz}
        result={result}
        onRetry={() => {
          setPhase("lobby");
          setAnswers({});
          setResult(null);
        }}
        onBack={() => navigate(-1)}
      />
    );
  }

  if (phase === "submitted") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-(--dark-navy)">
              Already Submitted
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              You have used all your attempts for{" "}
              <span className="font-semibold">{quiz?.title}</span>.
            </p>
            {quiz?.lastScore !== null && quiz?.lastScore !== undefined && (
              <p className="text-3xl font-black text-green-500 mt-4">
                {quiz.lastScore}%
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-2xl font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              background:
                "linear-gradient(135deg, var(--electric), var(--royal-blue))",
            }}
          >
            Back to Classroom
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const hintVisible = hintsShown[currentIndex];

  return (
    <div className="qp-active-page">
      <div className="qp-active-header">
        <div className="qp-active-header-inner">
          <div className="qp-active-info">
            <p className="qp-active-context">
              {quiz.classroom?.name || quiz.course?.title || "Quiz"}
            </p>
            <p className="qp-active-title">{quiz.title}</p>
          </div>
          <div
            className={`qp-timer ${timeCritical ? "qp-timer--critical" : ""}`}
          >
            <Clock size={15} className={timeCritical ? "qp-timer-pulse" : ""} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="qp-progress-wrap">
          <div className="qp-progress-labels">
            <span>
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="qp-progress-bar">
            <div
              className="qp-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="qp-active-body">
        <div className="qp-question-area">
          <div className="qp-question-card">
            <div className="qp-question-top">
              <div className="qp-question-meta">
                <span className="qp-question-num-badge">
                  {currentIndex + 1}
                </span>
                <span className="qp-question-type">
                  {question.type === "truefalse"
                    ? "True / False"
                    : "Multiple Choice"}
                </span>
              </div>
              {question.hint && (
                <button
                  onClick={toggleHint}
                  className={`qp-hint-btn ${hintVisible ? "qp-hint-btn--active" : ""}`}
                >
                  <Lightbulb size={13} /> Hint
                </button>
              )}
            </div>

            <h2 className="qp-question-text">{question.text}</h2>

            {hintVisible && (
              <div className="qp-hint-box">
                <Lightbulb size={15} className="qp-hint-box-icon" />
                <p>{question.hint}</p>
              </div>
            )}

            <div className="qp-options">
              {question.options.map((option, oi) => {
                const isSelected = selectedAnswer === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => selectAnswer(oi)}
                    className={`qp-option ${isSelected ? "qp-option--selected" : ""}`}
                  >
                    <span
                      className={`qp-option-radio ${isSelected ? "qp-option-radio--on" : ""}`}
                    >
                      {isSelected && <span className="qp-option-radio-dot" />}
                    </span>
                    <span className="qp-option-text">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="qp-nav-row">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="qp-nav-btn"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <div className="qp-dot-nav">
              {paginationItems.map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="qp-dot-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentIndex(item - 1)}
                    className={`qp-dot ${item - 1 === currentIndex ? "qp-dot--active" : answers[item - 1] !== undefined ? "qp-dot--answered" : ""}`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            {isLast ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting || answeredCount === 0}
                className="qp-submit-btn"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentIndex((p) =>
                    Math.min(quiz.questions.length - 1, p + 1),
                  )
                }
                className="qp-nav-btn qp-nav-btn--next"
              >
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const QuizResults = ({ quiz, result, onRetry, onBack }) => {
  const grade =
    result.percentage >= 90
      ? { label: "Excellent!", color: "#10B981", emoji: "🏆" }
      : result.percentage >= 75
        ? { label: "Great job!", color: "#3B82F6", emoji: "🎉" }
        : result.percentage >= 60
          ? { label: "Good effort", color: "#F59E0B", emoji: "👍" }
          : { label: "Keep practicing", color: "#EF4444", emoji: "💪" };

  return (
    <div className="qp-results-page">
      <div className="qp-results-wrap">
        <div className="qp-results-score-card">
          <span className="qp-results-emoji">{grade.emoji}</span>
          <h1 className="qp-results-grade">{grade.label}</h1>
          <p className="qp-results-quiz-name">{quiz.title}</p>

          <div className="qp-results-ring-wrap">
            <svg className="qp-results-ring" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={grade.color}
                strokeWidth="10"
                strokeDasharray={`${result.percentage * 2.51} 251`}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dasharray 1s ease",
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            </svg>
            <div className="qp-results-ring-label">
              <span className="qp-results-pct">{result.percentage}%</span>
              <span className="qp-results-pct-label">Score</span>
            </div>
          </div>

          <div className="qp-results-stats">
            {[
              { label: "Correct", value: result.score },
              { label: "Total Points", value: result.totalPoints },
              { label: "Attempts Left", value: result.attemptsLeft },
            ].map((item) => (
              <div key={item.label} className="qp-results-stat">
                <p className="qp-results-stat-val">{item.value}</p>
                <p className="qp-results-stat-label">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="qp-results-actions">
            {result.attemptsLeft > 0 && (
              <button onClick={onRetry} className="qp-results-retry">
                <RotateCcw size={16} /> Retry
              </button>
            )}
            <button onClick={onBack} className="qp-results-back">
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <div className="qp-review-card">
          <div className="qp-review-header">
            <h2>Question Review</h2>
          </div>
          <div className="qp-review-list">
            {result.questions.map((q, qi) => {
              const isCorrect = q.options.find((o) => o.selected)?.isCorrect;
              return (
                <div key={qi} className="qp-review-item">
                  <div className="qp-review-item-top">
                    <span
                      className={`qp-review-indicator ${isCorrect ? "qp-review-indicator--correct" : "qp-review-indicator--wrong"}`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </span>
                    <p className="qp-review-question">{q.text}</p>
                  </div>
                  <div className="qp-review-options">
                    {q.options.map((o, oi) => (
                      <div
                        key={oi}
                        className={`qp-review-option ${o.isCorrect ? "qp-review-option--correct" : o.selected && !o.isCorrect ? "qp-review-option--wrong" : ""}`}
                      >
                        {o.text}
                        {o.isCorrect && (
                          <span className="qp-review-tag qp-review-tag--correct">
                            ✓ Correct
                          </span>
                        )}
                        {o.selected && !o.isCorrect && (
                          <span className="qp-review-tag qp-review-tag--wrong">
                            ✗ Your answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {q.hint && (
                    <div className="qp-review-hint">
                      <Lightbulb size={13} />
                      {q.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
