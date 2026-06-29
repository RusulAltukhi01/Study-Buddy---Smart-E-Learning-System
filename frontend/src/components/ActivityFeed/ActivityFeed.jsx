
import "./ActivityFeed.css";

import { UserPlus, FileCheck, BookMarked, School, Clock } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Date.now() - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  // If it's older than 7 days, show the actual date format
  if (days > 7) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric", 
    });
  }

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

const EVENT_CONFIG = {
  joined:    { icon: UserPlus,    color: "text-emerald-500", bg: "bg-emerald-50", label: "joined" },
  submitted: { icon: FileCheck,   color: "text-blue-500",    bg: "bg-blue-50",    label: "submitted" },
  course:    { icon: BookMarked,  color: "text-violet-500",  bg: "bg-violet-50",  label: "course" },
  classroom: { icon: School,      color: "text-amber-500",   bg: "bg-amber-50",   label: "classroom" },
};

// Generates mock activity from real classroom/assignment data
function buildActivity(classrooms = [], assignments = []) {
  const events = [];

  classrooms.slice(0, 3).forEach((room) => {
    (room.students || []).slice(0, 2).forEach((s) => {
      events.push({
        id: `join-${room._id}-${s._id || s}`,
        type: "joined",
        text: `A student joined ${room.name}`,
        time: room.updatedAt,
      });
    });
  });

  assignments.slice(0, 3).forEach((a) => {
    if ((a.submissions?.length || 0) > 0) {
      events.push({
        id: `sub-${a._id}`,
        type: "submitted",
        text: `${a.submissions.length} submission${a.submissions.length !== 1 ? "s" : ""} on "${a.title}"`,
        time: a.updatedAt,
      });
    }
  });

  // Sort newest first, take 6
  return events
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 6);
}

const ActivityFeed = ({ classrooms = [], assignments = [], loading }) => {
  const activity = buildActivity(classrooms, assignments);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <Clock size={16} className="text-gray-400" />
        <h2 className="font-bold text-(--dark-navy) text-lg">Recent Activity</h2>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-48" />
                <div className="h-2.5 bg-gray-100 rounded w-16" />
              </div>
            </div>
          ))
        ) : activity.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No recent activity
          </div>
        ) : (
          activity.map((event) => {
            const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.classroom;
            const Icon = config.icon;
            return (
              <div key={event.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate font-semibold">{event.text}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(event.time)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
