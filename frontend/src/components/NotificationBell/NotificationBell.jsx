import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";


import "./NotificationBell.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ICONS = {
  quiz_opened: { emoji: "📝", bg: "#E6F1FB" },
  quiz_graded: { emoji: "✅", bg: "#EAF3DE" },
  assignment_posted: { emoji: "📋", bg: "#FBEAF0" },
  assignment_graded: { emoji: "✅", bg: "#EAF3DE" },
  assignment_deadline: { emoji: "⏰", bg: "#FCEBEB" },
  announcement: { emoji: "📢", bg: "#FAEEDA" },
  course_update: { emoji: "📚", bg: "#EEEDFE" },
};

export default function NotificationBell({ classroomIds = [] }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/notifications?page=${pageNum}&limit=15`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          pageNum === 1 ? data.data : [...prev, ...data.data],
        );
        setUnreadCount(data.unreadCount);
        setHasMore(data.data.length === 15);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  useEffect(() => {
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      // console.log("Socket connected", socket.id);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user._id) {
        // console.log("Joining user room:", user._id);
        socket.emit("join:user", user._id);
      }

      if (classroomIds.length) {
        // console.log("Joining classrooms:", classroomIds);
        socket.emit("join:classrooms", classroomIds);
      }
    });

    socket.on("notification", (notif) => {
      // console.log("Received notification:", notif);
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [classroomIds]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

const markRead = async (notif) => {
  if (!notif.read) {
    await fetch(`${API_URL}/api/notifications/${notif._id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }


  let finalPath = null;
  let highlightData = null;


  if (notif.action && notif.action.type === 'navigate') {
    const route = notif.action.params?.route;
    const metadata = notif.metadata || notif.action.params?.metadata;


    switch (route) {
      case 'STUDENT_CLASSROOM_ANNOUNCEMENTS':
        if (metadata?.classroomId) {
          finalPath = `/student/classrooms/${metadata.classroomId}/feed`;
          highlightData = {
            id: metadata.announcementId,
            type: 'announcement'
          };
        }
        break;
      
      case 'STUDENT_CLASSROOM_ASSIGNMENTS':
        if (metadata?.classroomId) {
          finalPath = `/student/classrooms/${metadata.classroomId}/assignments`;
          highlightData = {
            id: metadata.assignmentId,
            type: 'assignment'
          };
        }
        break;
      
      case 'STUDENT_CLASSROOM_QUIZZES':
        if (metadata?.classroomId) {
          finalPath = `/student/classrooms/${metadata.classroomId}/quizzes`;
          highlightData = {
            id: metadata.quizId,
            type: 'quiz'
          };
        }
        break;
      
      default:
        if (metadata?.classroomId) {
          finalPath = `/student/classrooms/${metadata.classroomId}/feed`;
          highlightData = {
            id: metadata.announcementId,
            type: 'announcement'
          };
        }
        break;
    }
  }

  if (!finalPath && notif.metadata?.classroomId) {
    finalPath = `/student/classrooms/${notif.metadata.classroomId}/feed`;
    highlightData = {
      id: notif.metadata.announcementId,
      type: 'announcement'
    };
  }

  if (finalPath) {
    console.log('Navigating to:', finalPath, 'with highlight:', highlightData);
    navigate(finalPath, {
      state: { highlight: highlightData },
      replace: false,
    });
  } else {
    console.warn('Could not determine navigation path for notification:', notif);
  }

  setOpen(false);
};

  const markAllRead = async () => {
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 40 && hasMore && !loading) {
      const next = page + 1;
      setPage(next);
      fetchNotifications(next);
    }
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="nb-wrap" ref={dropdownRef}>
      <button
        className="nb-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell size={24} className="bell-icon" strokeWidth={2} />
        {notifications.length > 0 && (
          <span className="nb-badge">{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <span className="nb-header-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="nb-mark-all" onClick={markAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="nb-list" onScroll={handleScroll}>
            {notifications.length === 0 && !loading ? (
              <div className="nb-empty">No notifications yet</div>
            ) : (
              notifications.map((n) => {
                const icon = ICONS[n.type] || { emoji: "🔔", bg: "#F1EFE8" };
                return (
                  <div
                    key={n._id}
                    className={`nb-item ${!n.read ? "unread" : ""}`}
                    onClick={() => markRead(n)}
                  >
                    <div className="nb-icon" style={{ background: icon.bg }}>
                      {icon.emoji}
                    </div>
                    <div className="nb-body">
                      <div className="nb-title">{n.title}</div>
                      <div className="nb-msg">{n.message}</div>
                      <div className="nb-time">{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read && <div className="nb-dot" />}
                  </div>
                );
              })
            )}
            {loading && <div className="nb-loading">Loading...</div>}
          </div>

          <div className="nb-footer">
            <button
              onClick={() => {
                navigate("/notifications");
                setOpen(false);
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
