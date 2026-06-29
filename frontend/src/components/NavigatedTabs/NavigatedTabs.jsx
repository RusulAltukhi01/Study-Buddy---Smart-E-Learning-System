import { BookCopy, Form, MessageSquare, NotebookText, Users } from "lucide-react";

const TAB_ICONS = {
  feed:        `${<MessageSquare />}`,
  students:    `${<Users />}`,
  courses:     `${<BookCopy />}`,
  quizzes:     `${<Form />}`,
  assignments: `${<NotebookText />}`,
};

const NavigatedTabs = ({ navigatedTabsNames, activeTab, onTabClick }) => {
  return (
    <div className="w-full border-b border-gray-100 px-6 mb-10 overflow-x-auto">
      <ul className="flex items-end gap-1 min-w-max">
        {navigatedTabsNames.map((item) => {
          const isActive = activeTab === item;
          return (
            <li
              key={item}
              onClick={() => onTabClick(item)}
              className="relative flex items-center gap-2 px-5 py-4 cursor-pointer select-none transition-all duration-150 group"
            >
              
              <span className={`text-base leading-none transition-all ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}>
                {TAB_ICONS[item] ?? "📄"}
              </span>

            
              <span
                className="text-sm font-bold capitalize tracking-wide transition-colors"
                style={{ color: isActive ? "var(--electric-dark)" : "#9ca3af" }}
              >
                {item}
              </span>

              
              {isActive && (
                <span
                  className="absolute bottom-0 left-30 right-0 h-0.5 rounded-t-full"
                  style={{ background: "#5bc0be" }}
                />
              )}

              
              {!isActive && (
                <span className="absolute bottom-0 left-30 right-0 h-0.5 rounded-t-full bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default NavigatedTabs;