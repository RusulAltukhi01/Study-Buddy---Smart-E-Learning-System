import { useEffect, useRef, useState } from "react";
import { Megaphone, Paperclip, Clock, ArrowRight, Bell } from "lucide-react";
import { getAnnouncements } from "../../services/announcementService";
import { useNavigate } from "react-router-dom";


function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)         return "just now";
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)  return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

const AnnouncementSkeleton = () => (
  <li className="flex gap-4 pl-5 py-1 animate-pulse">
    <div className="flex flex-col gap-2 flex-1">
      <div className="h-2.5 bg-slate-100 rounded w-24" />
      <div className="h-3.5 bg-slate-100 rounded w-48" />
      <div className="h-2.5 bg-slate-100 rounded w-full" />
      <div className="h-2.5 bg-slate-100 rounded w-3/4" />
    </div>
  </li>
);


const AnnouncementItem = ({ ann, isLast, isHighlighted = false }) => {
  const [hovered, setHovered] = useState(false);
  const [hasHighlighted, setHasHighlighted] = useState(isHighlighted);
  
  const plainText = stripHtml(ann.content);
  const authorName = ann.author
    ? `${ann.author.firstName ?? ""} ${ann.author.lastName ?? ""}`.trim()
    : null;

  useEffect(() => {
    if (isHighlighted) {
      const timer = setTimeout(() => {
        setHasHighlighted(false);
      }, 3000); 
      
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <li
      id={`announcement-${ann._id}`} 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex gap-4 group cursor-pointer transition-all duration-300 ${
        hasHighlighted ? 'highlight-pulse' : ''
      }`}
    >

      <div className="flex flex-col items-center flex-shrink-0 w-4">
        <div
          className={`
            w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 z-10
            transition-all duration-200
            ${hovered || hasHighlighted
              ? "bg-amber-400 border-amber-400 scale-125"
              : "bg-white border-slate-300"
            }
          `}
        />
     
        {!isLast && (
          <div
            className={`
              w-0.5 flex-1 mt-1 rounded-full transition-colors duration-200 min-h-[24px]
              ${hovered || hasHighlighted ? "bg-amber-200" : "bg-slate-100"}
            `}
          />
        )}
      </div>

    
      <div
        className={`
          flex-1 flex flex-col gap-1.5 pb-5 rounded-xl px-3 py-2.5 -mt-0.5
          transition-all duration-200
          ${hovered || hasHighlighted ? "bg-amber-50" : "bg-transparent"}
        `}
      >
        
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock size={10} className="flex-shrink-0" />
            <span>{timeAgo(ann.createdAt)}</span>
            {authorName && (
              <>
                <span className="text-slate-200">·</span>
                <span
                  className={`font-medium transition-colors duration-200 ${
                    hovered || hasHighlighted ? "text-amber-600" : "text-slate-500"
                  }`}
                >
                  {authorName}
                </span>
              </>
            )}
          </div>

          {ann.attachments?.length > 0 && (
            <span
              className={`
                flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
                transition-all duration-200
                ${hovered || hasHighlighted
                  ? "bg-amber-200 text-amber-800"
                  : "bg-slate-100 text-slate-500"
                }
              `}
            >
              <Paperclip size={9} />
              {ann.attachments.length} file{ann.attachments.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <p
          className={`
            text-sm font-semibold leading-snug line-clamp-1 transition-colors duration-200
            ${hovered || hasHighlighted ? "text-amber-800" : "text-slate-700"}
          `}
        >
          {plainText.slice(0, 80) || "Announcement"}
        </p>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {plainText}
        </p>
      </div>
    </li>
  );
};


const RecentAnnouncements = ({ classroomId, highlightData }) => {
  console.log("🔔 RecentAnnouncements - Received props:", {
    classroomId,
    highlightData
  });
  console.log("🔔 RecentAnnouncements - highlightData type:", typeof highlightData);
  console.log("🔔 RecentAnnouncements - highlightData value:", JSON.stringify(highlightData, null, 2));
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState(null);
  const navigate = useNavigate();
  const scrollTimeoutRef = useRef(null);

  // Debug logs
  console.log("RecentAnnouncements - highlightData prop:", highlightData);
  console.log("RecentAnnouncements - announcements loaded:", announcements.length);

  useEffect(() => {
    if (!classroomId) return;
    async function load() {
      try {
        const res = await getAnnouncements(classroomId);
        if (res.success) {
          setAnnouncements(res.data);
          console.log("Announcement IDs:", res.data.map(a => a._id));
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classroomId]);


  useEffect(() => {
    if (highlightData && highlightData.id && highlightData.type === 'announcement') {
      const announcementId = highlightData.id;
      console.log("🎯 Trying to highlight announcement:", announcementId);
      

      const announcementExists = announcements.some(a => a._id === announcementId);
      console.log("Announcement exists in list?", announcementExists);
      
      if (announcementExists) {
        setHighlightedId(announcementId);
        

        setTimeout(() => {
          const element = document.getElementById(`announcement-${announcementId}`);
          console.log("Found element:", element);
          
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 200);
        

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
      }
    }
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [highlightData, announcements]);
  const visible = announcements.slice(0, 4);
  const extra = announcements.length - visible.length;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl flex flex-col overflow-hidden shadow-sm">

      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Megaphone size={15} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 leading-tight">
              Announcements
            </h2>
            {!loading && announcements.length > 0 && (
              <p className="text-[11px] text-slate-400">
                {announcements.length} total
              </p>
            )}
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      <div className="h-px bg-slate-50 mx-5" />

   
      <div className="px-5 py-4 flex-1">
        {loading && (
          <ul className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <AnnouncementSkeleton key={i} />
            ))}
          </ul>
        )}

        {!loading && announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Bell size={20} className="text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">No announcements yet</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Check back later for updates
              </p>
            </div>
          </div>
        )}

        {!loading && announcements.length > 0 && (
          <ul className="flex flex-col">
            {visible.map((ann, i) => (
              <AnnouncementItem
                key={ann._id}
                ann={ann}
                isLast={i === visible.length - 1}
                isHighlighted={highlightedId === ann._id} 
              />
            ))}
          </ul>
        )}
      </div>

   
      {!loading && announcements.length > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={() => navigate(`/student/classrooms/${classroomId}/feed`)}
            className="
              w-full flex items-center justify-between
              px-4 py-3 rounded-xl
              bg-slate-50 hover:bg-amber-50
              border border-slate-100 hover:border-amber-200
              text-sm font-semibold text-slate-500 hover:text-amber-700
              transition-all duration-200 cursor-pointer group
            "
          >
            <span>
              View all announcements
              {extra > 0 && (
                <span className="ml-1.5 text-xs font-bold text-amber-500 bg-amber-50 group-hover:bg-amber-100 px-1.5 py-0.5 rounded-full transition-colors">
                  +{extra} more
                </span>
              )}
            </span>
            <ArrowRight
              size={15}
              className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all duration-200"
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentAnnouncements;