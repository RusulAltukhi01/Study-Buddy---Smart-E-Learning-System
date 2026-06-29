export function getCurrentQuizStatus(quiz) {
  const now = new Date();
  if (quiz.status === "draft") return "draft";

  const start = quiz.startDate ? new Date(quiz.startDate) : null;
  const due = quiz.dueDate ? new Date(quiz.dueDate) : null;

  if (start && start > now) return "scheduled";
  if (due && due < now) return "closed";
  return "opened";
}