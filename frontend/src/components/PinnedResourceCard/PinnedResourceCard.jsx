import { FileText, Video, Book, File } from "lucide-react";
import "./PinnedResourceCard.css";

const icons = {
  pdf:     { icon: FileText, bg: "bg-blue-100",  color: "text-blue-600"  },
  video:   { icon: Video,    bg: "bg-red-100",   color: "text-red-600"   },
  book:    { icon: Book,     bg: "bg-green-100", color: "text-green-600" },
  image:   { icon: FileText, bg: "bg-purple-100",color: "text-purple-600"},
  default: { icon: File,     bg: "bg-gray-100",  color: "text-gray-600"  },
};

const PinnedResourceCard = ({ type, title, content, url }) => {
  const { icon: IconComponent, bg, color } = icons[type] || icons.default;

  const card = (
    <div className="pinned-resource-card bg-white w-[15vw] h-[20vh] p-4 flex flex-col items-start justify-center gap-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-teal-200">
      <div className={`icon-wrapper ${bg} p-3 rounded-full`}>
        <IconComponent size={24} className={color} />
      </div>
      <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
      <p className="text-gray-500 font-semibold">{content}</p>
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="no-underline">
        {card}
      </a>
    );
  }

  return card;
};

export default PinnedResourceCard;