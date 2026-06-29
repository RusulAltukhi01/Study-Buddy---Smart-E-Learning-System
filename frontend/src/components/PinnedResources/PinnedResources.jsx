import { useEffect, useState } from "react";
import { Pin, Paperclip, FileText, ExternalLink, ChevronRight, X } from "lucide-react";
import { getAnnouncements } from "../../services/announcementService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";



const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return tmp.textContent || tmp.innerText || "";
};

const getFileIcon = (mimetype) => {
  if (mimetype?.includes("pdf"))   return "🔴";
  if (mimetype?.includes("image")) return "🖼️";
  if (mimetype?.includes("word"))  return "📄";
  return "📎";
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};



const ImagePreview = ({ url, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
    onClick={onClose}
  >
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button className="absolute -top-10 right-0 text-white cursor-pointer" onClick={onClose}>
        <X size={26} />
      </button>
      <img src={url} alt="Preview" crossOrigin="anonymous" className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl" />
    </div>
  </div>
);



const PinnedItem = ({ ann, onScrollTo }) => {
  const [expanded, setExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const plainText = stripHtml(ann.content);
  const authorName = `${ann.author?.firstName || ""} ${ann.author?.lastName || ""}`.trim();

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* accent strip */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#5bc0be,#6c63ff)" }} />

        <div className="p-4 flex flex-col gap-3">
          {/* header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <Pin size={13} className="text-cyan-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-cyan-600 uppercase tracking-wide leading-none">Pinned</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{authorName} · {formatDate(ann.createdAt)}</p>
              </div>
            </div>
           
            {ann.attachments?.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#5bc0be" }}>
                <Paperclip size={9} /> {ann.attachments.length}
              </span>
            )}
          </div>

         
          <div>
            <p className={`text-[13px] text-gray-700 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
              {plainText}
            </p>
            {plainText.length > 120 && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="text-[11px] font-semibold mt-1 cursor-pointer transition-colors"
                style={{ color: "#5bc0be" }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

  
          {ann.attachments?.length > 0 && (
            <div className="flex flex-col gap-2">
              {ann.attachments.map((file, i) => {
                const isImage = file.mimetype?.includes("image");
                const fileUrl = `${API_URL}${file.url}`;
                return (
                  <div key={i}>
                    {isImage && (
                      <div
                        className="relative rounded-xl overflow-hidden mb-1.5 cursor-pointer border border-gray-100"
                        onClick={() => setPreviewUrl(fileUrl)}
                      >
                        <img src={fileUrl} alt={file.originalName} crossOrigin="anonymous" className="w-full h-28 object-cover hover:opacity-90 transition-opacity" />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">Preview</span>
                      </div>
                    )}
                    <a
                      href={fileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 hover:border-gray-200 transition-colors group/file"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">{getFileIcon(file.mimetype)}</span>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-gray-700 truncate">{file.originalName || file.name}</p>
                          <p className="text-[10px] text-gray-400">{formatSize(file.size)}</p>
                        </div>
                      </div>
                      <ExternalLink size={13} className="text-gray-400 group-hover/file:text-gray-600 flex-shrink-0 ml-2 transition-colors" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

       
          <button
            onClick={() => onScrollTo(ann._id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 text-[12px] font-bold text-gray-600 transition-colors cursor-pointer"
          >
            View full post <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {previewUrl && <ImagePreview url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </>
  );
};


const PinnedResources = ({ classroomId, onScrollTo }) => {
  const [pinned,   setPinned]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAll,  setShowAll]  = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    async function fetchPinned() {
      try {
        const res = await getAnnouncements(classroomId);
        if (res.success) setPinned(res.data.filter((a) => a.pinned));
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchPinned();
  }, [classroomId]);

  const handleScrollTo = (id) => {
    if (typeof onScrollTo === "function") {
      onScrollTo(id);
    }
  };

  const visible = showAll ? pinned : pinned.slice(0, 3);

  if (!loading && pinned.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3">
    
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(91,192,190,0.12)" }}>
            <Pin size={14} style={{ color: "#5bc0be" }} />
          </div>
          <h2 className="font-bold text-[15px] text-gray-700">Pinned Resources</h2>
          {!loading && pinned.length > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#5bc0be" }}>
              {pinned.length}
            </span>
          )}
        </div>
      </div>

    
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {visible.map((ann) => (
              <PinnedItem key={ann._id} ann={ann} onScrollTo={handleScrollTo} />
            ))}
          </div>

          {pinned.length > 3 && (
            <button
              onClick={() => setShowAll((p) => !p)}
              className="text-[12px] font-semibold self-start transition-colors cursor-pointer"
              style={{ color: "#5bc0be" }}
            >
              {showAll ? "Show less" : `View all ${pinned.length} pinned →`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PinnedResources;