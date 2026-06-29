import "./UpcomingTasks.css";
import { useState } from "react";

const getDaysLeft = (dateTime) => {
  const now = new Date();
  const due = new Date(dateTime);
  const diff = due.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (dateTime) => {
  return new Date(dateTime)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    .toUpperCase();
};

const getBadgeColor = (daysLeft) => {
  if (daysLeft < 0) return "bg-red-100 text-red-500";
  if (daysLeft === 0) return "bg-red-100 text-red-800";
  if (daysLeft <= 3) return "bg-yellow-100 text-yellow-800";
  if (daysLeft <= 7) return "bg-blue-100 text-blue-800";
  return "bg-green-100 text-green-800";
};

const getBadgeText = (daysLeft) => {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return "Due Today";
  if (daysLeft === 1) return "Due Tomorrow";
  if (daysLeft <= 7) return `Due in ${daysLeft} days`;
  return `${daysLeft} days left`;
};

const UpcomingTasks = () => {
  const [tasks] = useState(() => {
    const saved = localStorage.getItem("studentTasks");
    if (!saved) return [];
    return JSON.parse(saved)
      .filter((t) => t.status !== "completed")
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .slice(0, 5);
  });

  if (tasks.length === 0) return null;

  return (
    <div className="upcoming-tasks w-full py-6 px-8">
      <h1 className="font-bold text-[2.2em] text-(--dark-navy)">
        Upcoming Tasks
      </h1>
      <main className="upcoming-tasks-content w-full">
        <ul className="w-full py-8 space-y-4">
          {tasks.map((task) => {
            const daysLeft = getDaysLeft(task.dateTime);
            return (
              <li
                key={task.id}
                className="w-full flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="min-w-[80px] font-bold text-gray-700 flex flex-col bg-gray-100 px-2 py-6 rounded-2xl text-center">
                  <span className="electric-gradient-text">
                    {formatDate(task.dateTime)}
                  </span>
                </div>
                <div className="flex-grow p-4">
                  <h3 className="font-bold text-[1.4em] text-(--dark-navy)">
                    {task.title}
                  </h3>
                  <p className="text-gray-400 font-semibold pl-2">
               
                    Added{" "}
                    {new Date(task.dateTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(task.dateTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {task.description && ` • ${task.description}`}
                  </p>
                </div>
                <div className="min-w-[120px] text-right">
                  <span
                    className={`inline-block font-semibold text-sm px-4 py-2 rounded-full ${getBadgeColor(daysLeft)}`}
                  >
                    {getBadgeText(daysLeft)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default UpcomingTasks;
