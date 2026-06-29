import { Pencil, Trash2 } from "lucide-react";
import "./TaskItem.css";
import { useState, useEffect } from "react";

const TaskItem = ({ task, badge, onEdit, onDelete, onToggleComplete }) => {
  const isTaskCompleted = task.status === "completed";
  const [isChecked, setIsChecked] = useState(isTaskCompleted);

  useEffect(() => {
    setIsChecked(isTaskCompleted);
  }, [isTaskCompleted]);

  function handleCheckTask() {
    setIsChecked(!isChecked);
    onToggleComplete();
  }

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete();
    }
  };

 
  const resolvedBadge =
    badge ??
    (() => {
      if (isTaskCompleted) return { label: "Done", cls: "badge-done" };
      const diff = Math.floor(
        (new Date(task.dateTime) - Date.now()) / 86_400_000,
      );
      if (diff <= 0) return { label: "Today", cls: "badge-today" };
      if (diff === 1) return { label: "Tomorrow", cls: "badge-tomorrow" };
      return { label: `${diff}d`, cls: "badge-future" };
    })();

  const displayDate = task.dateTime
    ? new Date(task.dateTime).toLocaleDateString()
    : task.date || "No date";

  return (
    <div className={`task-card ${isChecked ? "task-card--done" : ""}`}>
     
      <div className="task-accent" />

    
      <div className="checkbox-wrapper-12" onClick={handleCheckTask}>
        <div className="cbx">
          <input
            id={`cbx-${task.id}`}
            checked={isChecked}
            type="checkbox"
            readOnly
          />
          <label htmlFor={`cbx-${task.id}`} />
          <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
            <path d="M2 8.36364L6.23077 12L13 2" />
          </svg>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
          <defs>
            <filter id={`goo-${task.id}`}>
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="4"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7"
                result={`goo-${task.id}`}
              />
              <feBlend in="SourceGraphic" in2={`goo-${task.id}`} />
            </filter>
          </defs>
        </svg>
      </div>

    
      <div className="task-body  flex justify-between items-center">
        <div className="left-side flex flex-col">
          <div className="task-title-row">
            <span
              className={`task-title ${isChecked ? "task-title--done" : ""}`}
            >
              {task.title}
            </span>
          </div>

          {task.description && (
            <p className={`task-desc ${isChecked ? "task-desc--done" : ""}`}>
              {task.description}
            </p>
          )}

          <div className="task-meta">
            <span className="task-time">{task.time}</span>
            {task.time && <span className="task-meta-sep">·</span>}
            <span className="task-date">{displayDate}</span>
          </div>
        </div>

        <span className={`task-badge mx-5 ${resolvedBadge.cls}`}>
          {resolvedBadge.label}
        </span>
      </div>

    
      <div className="task-actions">
        <button
          onClick={handleEditClick}
          className="task-btn task-btn--edit"
          title="Edit task"
        >
          <Pencil size={13} color="var(--royal-blue)" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="task-btn task-btn--delete"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
