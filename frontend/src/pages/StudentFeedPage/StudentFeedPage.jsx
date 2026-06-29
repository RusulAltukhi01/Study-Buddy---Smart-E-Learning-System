import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  Download, 
  FilePen, 
  FileText, 
  Image, 
  Loader2, 
  Pin, 
  X, 
  Megaphone,
  Paperclip
} from "lucide-react";
import { getAnnouncements } from "../../services/announcementService";
import { toast } from "sonner";
import ContactInstructor from "../../components/ContactInstructor/ContactInstructor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getAvatarUrl(profilePicture) {
  if (!profilePicture) return null;
  const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const path = profilePicture.startsWith("/") ? profilePicture : `/${profilePicture}`;
  return `${base}${path}`;
}

function getFileIcon(mimetype) {
  if (mimetype?.includes("pdf")) return <FileText className="text-red-500" size={18} />;
  if (mimetype?.includes("image")) return <Image className="text-blue-500" size={18} />;
  if (mimetype?.includes("word")) return <FilePen className="text-indigo-500" size={18} />;
  return <Paperclip className="text-gray-400" size={18} />;
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMimeLabel(mimetype) {
  if (!mimetype) return "FILE";
  if (mimetype.includes("pdf")) return "PDF";
  if (mimetype.includes("image")) return "IMAGE";
  if (mimetype.includes("word")) return "DOCX";
  return mimetype.split("/")[1]?.toUpperCase() || "FILE";
}


const StudentAnnouncementCard = ({ announcement }) => {
  const { author, content, attachments, createdAt, pinned } = announcement;
  const [previewUrl, setPreviewUrl] = useState(null);
  const avatar = getAvatarUrl(author?.profilePicture);
  const authorName = `${author?.firstName || ""} ${author?.lastName || ""}`.trim();

  return (
    <>
      <article className={`bg-white rounded-2xl border ${pinned ? "border-amber-200 bg-amber-50/10" : "border-gray-100"} border-l-4 ${pinned ? "border-l-amber-500" : "border-l-emerald-600"} shadow-sm hover:shadow-md transition-all overflow-hidden`}>
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          
         
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                {avatar ? (
                  <img src={avatar} alt={authorName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-emerald-800 text-xs">
                    {author?.firstName?.charAt(0)}{author?.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{authorName}</p>
                <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock size={11} /> {timeAgo(createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pinned && (
                <span className="flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <Pin size={10} className="fill-amber-700" /> Pinned
                </span>
              )}
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Broadcast
              </span>
            </div>
          </header>

          
          <div 
            className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          
          {attachments?.length > 0 && (
            <div className="mt-2 pt-4 border-t border-gray-50">
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-2.5">Attachments</p>
              <ul className="grid grid-cols-1 gap-2">
                {attachments.map((file, i) => {
                  const isImage = file.mimetype?.includes("image");
                  const fileUrl = `${API_URL}${file.url}`;
                  return (
                    <li key={i} className="flex flex-col gap-2">
                      {isImage && (
                        <div 
                          className="relative max-w-md cursor-zoom-in rounded-xl overflow-hidden border border-gray-100 shadow-inner group bg-gray-50"
                          onClick={() => setPreviewUrl(fileUrl)}
                        >
                          <img 
                            src={fileUrl} 
                            alt={file.originalName} 
                            crossOrigin="anonymous" 
                            className="w-full max-h-48 object-cover group-hover:opacity-95 transition-opacity" 
                          />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm">Expand Image</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-gray-100/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white border border-gray-200/60 flex items-center justify-center flex-shrink-0">
                            {getFileIcon(file.mimetype)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-700 truncate">{file.originalName}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                              {formatFileSize(file.size)} • {getMimeLabel(file.mimetype)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold px-3 py-2 rounded-xl hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer flex-shrink-0 shadow-sm"
                        >
                          <Download size={13} /> Download
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </article>

   
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-all animate-fadeIn"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              className="absolute -top-12 right-0 text-gray-300 hover:text-white cursor-pointer bg-white/10 p-2 rounded-full transition-colors" 
              onClick={() => setPreviewUrl(null)}
            >
              <X size={20} />
            </button>
            <img src={previewUrl} alt="Expanded Content Display" crossOrigin="anonymous" className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </>
  );
};


const StudentFeedPage = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classroomId) return;
    let isMounted = true;

    async function fetchAnnouncements() {
      try {
        const res = await getAnnouncements(classroomId);
        if (res.success && isMounted) {
          setAnnouncements(res.data || []);
        }
      } catch (err) {
        console.error("Feed data layer connection failed:", err);
        toast.error("Failed to load announcements");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAnnouncements();

    return () => { isMounted = false; };
  }, [classroomId]);

  return (
    <main className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8" aria-label="Classroom Bulletins">
      
      
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-700 transition-colors cursor-pointer font-bold text-xs"
        >
          <ArrowLeft size={14} /> Back to Classroom
        </button>
      </div>

      
      <div className="rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46]">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none bg-radial-gradient from-emerald-200 to-transparent translate-x-[30%] -translate-y-[30%]" />
        <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none bg-radial-gradient from-teal-200 to-transparent translate-y-[50%]" />

        <div className="relative z-10 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-200 bg-emerald-500/20 px-2.5 py-0.5 rounded-full w-fit">
            Notice Board
          </span>
          <h1 className="text-white text-xl sm:text-2xl font-extrabold italic leading-tight">Announcements</h1>
          <p className="text-emerald-100 opacity-90 text-[13px]">Stay up to date with notices and study materials published by your instructor.</p>
        </div>

        {!loading && (
          <div className="relative z-10 bg-white/10 rounded-xl px-4 py-2 flex items-center gap-2.5 self-start sm:self-center backdrop-blur-sm border border-white/5">
            <Megaphone size={16} className="text-emerald-300 animate-pulse" />
            <span className="text-sm font-bold text-white">
              {announcements.length} Update{announcements.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        
        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Loader2 className="animate-spin text-emerald-600" size={28} />
              <p className="text-xs text-gray-400 font-medium mt-2">Loading workspace bulletin board...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-300">
                <Megaphone size={20} />
              </div>
              <p className="text-base font-bold text-gray-700">No announcements yet</p>
              <p className="text-sm text-gray-400 mt-0.5">Your instructor hasn't broadcasted any updates to this feed.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {announcements.map((ann) => (
                <StudentAnnouncementCard key={ann._id} announcement={ann} />
              ))}
            </div>
          )}
        </div>

  
        <aside className="w-full lg:sticky lg:top-6">
          <ContactInstructor />
        </aside>
      </div>
    </main>
  );
};

export default StudentFeedPage;