import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../contexts/AuthContext";
import Logo from "../../UI/Logo/Logo";
import { X } from "lucide-react";

const SidebarContext = createContext();

export const Sidebar = ({
  children,
  activeTab,
  setActiveTab,
  isExpanded,
  setIsExpanded,
  bottomItems,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleActive(tabName) {
    setActiveTab(tabName);
    navigate(`/${user.role}/${tabName}`);
  }

  return (
    <aside
      className={`
        flex flex-col min-h-screen bg-[#f0f4f4] border-r border-slate-200
        transition-all duration-300 ease-in-out flex-shrink-0
        ${isExpanded ? "w-56" : "w-[72px]"}
      `}
    >
   
      <ul className="flex items-center h-16 px-4 mb-6 border-b border-slate-200/70">
        {/* {isExpanded && (
          <span className="text-sm font-bold text-teal-700 tracking-wide flex-1 w-full whitespace-nowrap">
            <Logo />
          </span>
        )} */}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            text-slate-400 hover:text-teal-700 hover:bg-teal-50
            transition-all cursor-pointer border-none bg-transparent flex-shrink-0
            ${!isExpanded ? "mx-auto" : " items-center justify-end w-full"}
          `}
        >
          {isExpanded ? (
            <X size={16}/>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </ul>

      <SidebarContext.Provider value={{ isExpanded, setIsExpanded, activeTab, handleActive }}>
        <ul className="flex flex-col gap-0.5 flex-1 px-3 py-4 gap-6">
          {children}
        </ul>


        {bottomItems && (
          <div className="px-3 pb-4 border-t border-slate-200/70 pt-3 flex flex-col gap-0.5">
            {bottomItems}
          </div>
        )}
      </SidebarContext.Provider>
    </aside>
  );
};

export function SidebarItems({ icon, text, tabName, alert }) {
  const { isExpanded, activeTab, handleActive } = useContext(SidebarContext);
  const isActive = activeTab === tabName;

  return (
    <li
      onClick={() => handleActive(tabName)}
      title={!isExpanded ? text : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-150 group select-none
        ${isActive
          ? "bg-white text-teal-700 shadow-sm"
          : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
        }
      `}
    >

      {isActive && (
        <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-600 rounded-l-full" />
      )}


      <span
        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center
          ${isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}
          transition-colors
        `}
      >
        {icon}
      </span>


      <span
        className={`
          text-[11px] font-bold tracking-widest uppercase whitespace-nowrap
          overflow-hidden transition-all duration-300
          ${isExpanded ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"}
          ${isActive ? "text-teal-700" : "text-slate-500 group-hover:text-slate-700"}
        `}
      >
        {text}
      </span>

   
      {alert && (
        <span className="ml-auto w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
      )}


      {!isExpanded && (
        <div className="
          absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white
          text-[10px] font-bold tracking-widest uppercase rounded-lg
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 whitespace-nowrap z-50
          shadow-lg
        ">
          {text}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
        </div>
      )}
    </li>
  );
}

export default Sidebar;