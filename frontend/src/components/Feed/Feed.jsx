import { memo, useEffect, useRef, useState } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import "./Feed.css";
import {
  Bookmark,
  ChartNoAxesCombined,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Pencil,
  Pin,
  Trash2,
  X,
  Edit,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import defaultAvatar from "../../assets/default-avatar.png";
import {
  getAnnouncements,
  postAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePinAnnouncement,
} from "../../services/announcementService";
import assignmentService from "../../services/assignmentService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Feed = ({ classroomId }) => {
  const [editorContent, setEditorContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [posting, setPosting] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showAllPinned, setShowAllPinned] = useState(false);

  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [performanceAlerts, setPerformanceAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const visibleAnnouncements = showAll
    ? announcements
    : announcements.slice(0, 3);

  const announcementRefs = useRef({});
  const [highlightedId, setHighlightedId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!classroomId) return;
    const fetchAnnouncements = async () => {
      try {
        const res = await getAnnouncements(classroomId);
        if (res.success) setAnnouncements(res.data);
      } catch {
        toast.error("Failed to load announcements");
      } finally {
        setLoadingFeed(false);
      }
    };
    fetchAnnouncements();
  }, [classroomId]);

  useEffect(() => {
    if (!classroomId) return;
    const fetchAssignmentsData = async () => {
      try {
        setLoadingPending(true);
        setLoadingAlerts(true);
        const response = await assignmentService.getAssignments({
          classroomId,
          limit: 100,
        });
        const assignments = response.data || [];

        const pending = [];
        assignments.forEach((assignment) => {
          if (assignment.submissions?.length > 0) {
            const pendingSubs = assignment.submissions.filter(
              (sub) => sub.status !== "graded" && sub.submittedAt
            );
            if (pendingSubs.length > 0) {
              pending.push({
                id: assignment._id,
                title: assignment.title,
                pendingCount: pendingSubs.length,
                latestSubmission: new Date(
                  Math.max(...pendingSubs.map((s) => new Date(s.submittedAt)))
                ),
                dueDate: assignment.dueDate,
                submissions: pendingSubs,
              });
            }
          }
        });
        pending.sort((a, b) => b.latestSubmission - a.latestSubmission);
        setPendingSubmissions(pending.slice(0, 5));

        const alerts = [];
        assignments.forEach((assignment) => {
          if (
            assignment.submissions?.length > 0 &&
            assignment.points
          ) {
            const gradedSubs = assignment.submissions.filter(
              (sub) => sub.score !== null && sub.score !== undefined
            );
            if (gradedSubs.length > 0) {
              const totalScore = gradedSubs.reduce(
                (sum, sub) => sum + (sub.score || 0),
                0
              );
              const avgScore =
                (totalScore / (gradedSubs.length * assignment.points)) * 100;
              if (avgScore < 60) {
                const failedCount = gradedSubs.filter(
                  (sub) => (sub.score / assignment.points) * 100 < 60
                ).length;
                alerts.push({
                  id: assignment._id,
                  title: assignment.title,
                  avgScore: Math.round(avgScore),
                  failedCount,
                  totalSubmissions: gradedSubs.length,
                  failedPercentage: Math.round(
                    (failedCount / gradedSubs.length) * 100
                  ),
                });
              }
            }
          }
        });
        alerts.sort((a, b) => a.avgScore - b.avgScore);
        setPerformanceAlerts(alerts.slice(0, 3));
      } catch (error) {
        console.error("Error fetching assignments data:", error);
      } finally {
        setLoadingPending(false);
        setLoadingAlerts(false);
      }
    };
    fetchAssignmentsData();
  }, [classroomId]);

  const handleFileSelected = (file) => setAttachments((prev) => [...prev, file]);
  const removeAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const handlePost = async () => {
    const plainText = editorContent.replace(/<[^>]*>/g, "").trim();
    if (!plainText) {
      toast.error("Please write something before posting.");
      return;
    }
    if (plainText.length > 5000) {
      toast.error(`Content exceeds 5000 characters. Current: ${plainText.length}`);
      return;
    }
    setPosting(true);
    try {
      const res = await postAnnouncement(classroomId, editorContent, attachments);
      if (res.success) {
        setAnnouncements((prev) => [res.data, ...prev]);
        setEditorContent("");
        setAttachments([]);
        toast.success("Announcement posted!");
      } else {
        toast.error(res.error || "Failed to post announcement");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (announcementId) => {
    try {
      await deleteAnnouncement(announcementId);
      setAnnouncements((prev) => prev.filter((a) => a._id !== announcementId));
      toast.success("Announcement deleted");
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const handleUpdate = (announcementId, newContent) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a._id === announcementId ? { ...a, content: newContent } : a
      )
    );
  };

  const handleTogglePin = async (announcementId, pinned) => {
    try {
      await togglePinAnnouncement(announcementId);
      setAnnouncements((prev) =>
        prev
          .map((a) =>
            a._id === announcementId ? { ...a, pinned: !pinned } : a
          )
          .sort((a, b) => b.pinned - a.pinned)
      );
      toast.success(pinned ? "Post unpinned" : "Post pinned");
    } catch {
      toast.error("Failed to update pin");
    }
  };

  const handleScrollToPost = (id) => {
    setShowAll(true);
    setTimeout(() => {
      const el = announcementRefs.current[id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(id);
        setTimeout(() => setHighlightedId(null), 2500);
      }
    }, 100);
  };

  const getImageUrl = () => {
    if (!user?.profilePicture) return defaultAvatar;
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const imagePath = user.profilePicture.startsWith("/")
      ? user.profilePicture
      : `/${user.profilePicture}`;
    return `${baseUrl}${imagePath}`;
  };

  const totalPendingCount = pendingSubmissions.reduce(
    (sum, item) => sum + item.pendingCount,
    0
  );

  const pinnedAnnouncements = announcements.filter((a) => a.pinned);
  const visiblePinned = showAllPinned
    ? pinnedAnnouncements
    : pinnedAnnouncements.slice(0, 3);

  return (
    <section className="w-full flex flex-col lg:flex-row gap-6 mt-6 pb-12">

      
      <main className="flex flex-col flex-1 gap-5 min-w-0">

      
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-[#3a506b]/10 border border-[#3a506b]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.profilePicture ? (
                <img
                  src={getImageUrl()}
                  alt={`${user.firstName || ""} ${user.lastName || ""}`}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="text-[#3a506b] font-bold text-sm"
                style={{ display: user?.profilePicture ? "none" : "flex" }}
              >
                {user?.firstName?.charAt(0)?.toUpperCase() || ""}
                {user?.lastName?.charAt(0)?.toUpperCase() || ""}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#3a506b]">New Announcement</p>
              <p className="text-xs text-slate-400 ml-1">Visible to all students in this classroom</p>
            </div>
          </div>

          <div className="px-5 py-3">
            <RichTextEditor content={editorContent} onChange={setEditorContent} />
          </div>

          {attachments.length > 0 && (
            <ul className="px-5 pb-3 flex flex-col gap-2">
              {attachments.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <FileText size={15} className="text-slate-400" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-slate-400 text-xs">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-[#25c7b1] transition-colors text-sm font-medium">
              <Paperclip size={17} />
              Attach file
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  Array.from(e.target.files).forEach(handleFileSelected);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={handlePost}
              disabled={posting}
              className="flex items-center gap-2 bg-[#25c7b1] hover:bg-[#5bc0be] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              {posting && <Loader2 size={14} className="animate-spin" />}
              {posting ? "Posting…" : "Post Now"}
            </button>
          </div>
        </div>

    
        {loadingFeed ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-slate-400" size={22} />
          </div>
        ) : announcements.length > 0 ? (
          <div className="flex flex-col gap-4">
            {visibleAnnouncements.map((ann) => (
              <AnnouncementCard
                key={ann._id}
                announcement={ann}
                apiUrl={API_URL}
                currentUserId={user?._id || user?.id}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onTogglePin={handleTogglePin}
                cardRef={(el) => (announcementRefs.current[ann._id] = el)}
                isHighlighted={highlightedId === ann._id}
              />
            ))}
            {announcements.length > 3 && (
              <button
                onClick={() => setShowAll((p) => !p)}
                className="text-[#3b82f6] font-semibold text-sm hover:underline cursor-pointer self-start mt-1"
              >
                {showAll
                  ? "Show less"
                  : `View all ${announcements.length} announcements`}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <p className="text-slate-400 text-sm font-medium">No announcements yet.</p>
            <p className="text-slate-300 text-xs mt-1">Your first post will appear here.</p>
          </div>
        )}
      </main>

   
      <aside className="flex flex-col gap-5 w-full lg:w-[320px] xl:w-[340px] flex-shrink-0">

      
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3b83f638] flex items-center justify-center">
                <Pin size={14} className="text-[#3b82f6]" />
              </div>
              <h2 className="font-bold text-sm text-[#3a506b]">Pinned Resources</h2>
            </div>
            <button className="text-slate-400 hover:text-[#3a506b] transition-colors cursor-pointer">
              <Edit size={15} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {pinnedAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-5">
                No pinned posts yet.
              </p>
            ) : (
              <>
                {visiblePinned.map((ann) => (
                  <div
                    key={ann._id}
                    onClick={() => handleScrollToPost(ann._id)}
                    className="flex flex-col gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div
                      className="text-xs text-[#3a506b] line-clamp-2 prose prose-xs max-w-none"
                      dangerouslySetInnerHTML={{ __html: ann.content }}
                    />
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-[#3b82f6] font-semibold flex items-center gap-1">
                        <Pin size={9} />
                        {ann.author?.firstName} {ann.author?.lastName}
                      </p>
                      {ann.attachments?.length > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#25c7b1] px-2 py-0.5 rounded-full">
                          <Paperclip size={8} />
                          {ann.attachments.length} file{ann.attachments.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">No files</span>
                      )}
                    </div>
                  </div>
                ))}
                {pinnedAnnouncements.length > 3 && (
                  <button
                    onClick={() => setShowAllPinned((p) => !p)}
                    className="text-[#3b82f6] text-xs font-semibold hover:underline cursor-pointer self-start mt-1"
                  >
                    {showAllPinned
                      ? "Show less"
                      : `View all ${pinnedAnnouncements.length} pinned`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

      
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#3b83f638] flex items-center justify-center">
                <ClipboardCheck size={14} className="text-[#3b82f6]" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[#3a506b] leading-tight">
                  Pending Submissions
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {loadingPending
                    ? "Loading…"
                    : totalPendingCount === 0
                    ? "All caught up"
                    : `${totalPendingCount} awaiting review`}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                navigate(`/instructor/classrooms/${classroomId}/assignments`)
              }
              className="text-xs font-bold text-[#3b82f6] hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-0.5"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {loadingPending ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={28} className="text-[#25c7b1] mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">All graded!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No submissions waiting for review.
                </p>
              </div>
            ) : (
              pendingSubmissions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#25c7b1]/40 hover:bg-slate-50 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3a506b] truncate capitalize">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.pendingCount} student{item.pendingCount !== 1 ? "s" : ""} •{" "}
                      {formatTimeAgo(item.latestSubmission)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/instructor/assignments/${item.id}/submissions`)
                    }
                    className="flex-shrink-0 text-xs font-bold bg-[#25c7b1] hover:bg-[#5bc0be] text-white px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Grade
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

     
        {(loadingAlerts || performanceAlerts.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle size={14} className="text-rose-500" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[#3a506b] leading-tight">
                  Performance Alerts
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {loadingAlerts
                    ? "Loading…"
                    : `${performanceAlerts.length} module${performanceAlerts.length !== 1 ? "s" : ""} need attention`}
                </p>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {loadingAlerts ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-slate-400" size={20} />
                </div>
              ) : (
                performanceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-100"
                  >
                    <p className="text-sm font-bold text-[#3a506b] mb-1 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      <span className="text-rose-600 font-semibold">
                        {alert.failedPercentage}% failed
                      </span>{" "}
                      ({alert.failedCount}/{alert.totalSubmissions} students) · avg{" "}
                      <span className="font-semibold text-rose-600">
                        {alert.avgScore}%
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/instructor/assignments/${alert.id}/submissions`
                          )
                        }
                        className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                      <button className="text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                        Schedule session
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </aside>
    </section>
  );
};



const AnnouncementCard = memo(
  ({
    announcement,
    apiUrl,
    currentUserId,
    onDelete,
    onUpdate,
    onTogglePin,
    cardRef,
    isHighlighted,
  }) => {
    const { author, content, attachments, createdAt, pinned } = announcement;
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const [saving, setSaving] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isOwner =
      currentUserId?.toString() === author?._id?.toString();
    const authorName =
      `${author?.firstName || ""} ${author?.lastName || ""}`.trim();

    const timeAgo = (date) => {
      const diff = (Date.now() - new Date(date)) / 1000;
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return new Date(date).toLocaleDateString();
    };

    const getAvatarUrl = (pic) => {
      if (!pic) return null;
      const base = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
      return `${base}${pic.startsWith("/") ? pic : `/${pic}`}`;
    };

    const avatar = getAvatarUrl(author?.profilePicture);

    const getFileIcon = (mimetype) => {
      if (mimetype?.includes("pdf")) return "🔴";
      if (mimetype?.includes("image")) return "🖼️";
      if (mimetype?.includes("word")) return "📄";
      return "📎";
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return "";
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getMimeLabel = (mimetype) => {
      if (!mimetype) return "FILE";
      if (mimetype.includes("pdf")) return "PDF";
      if (mimetype.includes("image")) return "IMAGE";
      if (mimetype.includes("word")) return "WORD";
      return mimetype.split("/")[1]?.toUpperCase() || "FILE";
    };

    const handleSaveEdit = async () => {
      if (!editContent?.trim() || editContent === "<p></p>") {
        toast.error("Content cannot be empty");
        return;
      }
      setSaving(true);
      try {
        const res = await updateAnnouncement(announcement._id, editContent);
        if (res.success) {
          onUpdate(announcement._id, editContent);
          setIsEditing(false);
          toast.success("Announcement updated");
        }
      } catch {
        toast.error("Failed to update");
      } finally {
        setSaving(false);
      }
    };

    const handleDelete = async () => {
      try {
        await onDelete(announcement._id);
        setConfirmDelete(false);
      } catch {
        toast.error("Failed to delete");
      }
    };

    return (
      <>
        <div
          ref={cardRef}
          className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-500 ${
            isHighlighted
              ? "border-[#25c7b1] shadow-[0_0_0_3px_rgba(37,199,177,0.15)]"
              : "border-slate-200"
          }`}
        >
      
          <div className={`h-1 w-full ${pinned ? "bg-[#3b82f6]" : "bg-[#25c7b1]"}`} />

          <div className="p-5 flex flex-col gap-4">
         
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={authorName}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-[#3a506b] text-sm">
                      {author?.firstName?.charAt(0)}
                      {author?.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#3a506b] text-sm leading-tight">
                    {authorName}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {timeAgo(createdAt)}
                    {pinned && (
                      <span className="ml-1.5 flex items-center gap-0.5 text-[#3b82f6] font-semibold">
                        <Pin size={9} /> Pinned
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#25c7b1] border border-[#25c7b1]/40 bg-[#25c7b1]/10 px-2.5 py-1 rounded-full uppercase">
                  Announcement
                </span>
                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu((p) => !p)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-36 overflow-hidden">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDelete(true);
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                          <button
                            onClick={() => {
                              onTogglePin(announcement._id, pinned);
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b82f6] hover:bg-blue-50 cursor-pointer"
                          >
                            <Pin size={13} />
                            {pinned ? "Unpin" : "Pin to top"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

           
            {isEditing ? (
              <div className="flex flex-col gap-3">
                <RichTextEditor content={editContent} onChange={setEditContent} />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(content);
                    }}
                    className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-4 py-2 text-sm text-white bg-[#25c7b1] hover:bg-[#5bc0be] rounded-xl disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

        
            {attachments?.length > 0 && (
              <>
                <div className="h-px bg-slate-100" />
                <ul className="flex flex-col gap-3">
                  {attachments.map((file, i) => {
                    const isImage = file.mimetype?.includes("image");
                    const fileUrl = `${apiUrl}${file.url}`;
                    return (
                      <li key={i} className="flex flex-col gap-2">
                        {isImage && (
                          <div
                            className="relative cursor-pointer rounded-xl overflow-hidden border border-slate-200"
                            onClick={() => setPreviewUrl(fileUrl)}
                          >
                            <img
                              src={fileUrl}
                              alt={file.originalName}
                              crossOrigin="anonymous"
                              className="w-full max-h-64 object-cover hover:opacity-90 transition-opacity"
                            />
                            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              Click to expand
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getFileIcon(file.mimetype)}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-[#3a506b] truncate">
                                {file.originalName}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatFileSize(file.size)} · {getMimeLabel(file.mimetype)}
                              </span>
                            </div>
                          </div>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 bg-[#3a506b] hover:bg-[#3a506b]/80 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors ml-3 flex-shrink-0"
                          >
                            <Download size={13} />
                            Download
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

           
            <div className="h-px bg-slate-100" />
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#3a506b] text-xs font-semibold cursor-pointer transition-colors">
                <MessageSquare size={14} />
                Reply
              </button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#3b82f6] text-xs font-semibold cursor-pointer transition-colors">
                <Bookmark size={14} />
                Save
              </button>
            </div>
          </div>
        </div>

     
        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
            onClick={() => setPreviewUrl(null)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute -top-10 right-0 text-white cursor-pointer"
                onClick={() => setPreviewUrl(null)}
              >
                <X size={26} />
              </button>
              <img
                src={previewUrl}
                alt="Preview"
                crossOrigin="anonymous"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}

  
        {confirmDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setConfirmDelete(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h3 className="font-bold text-[#3a506b] text-base">
                  Delete Announcement
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  This action cannot be undone. Are you sure?
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm text-white bg-rose-500 hover:bg-rose-600 rounded-xl cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default Feed;