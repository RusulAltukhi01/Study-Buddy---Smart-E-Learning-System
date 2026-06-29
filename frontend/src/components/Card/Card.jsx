const Card = ({ title, description, features = [], buttonLabel, buttonIcon }) => {
  return (
    <div className="relative flex flex-col bg-white rounded-2xl border border-gray-100 p-7 w-75 min-h-90  shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-indigo-50 opacity-70 pointer-events-none" />
      <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-indigo-100 opacity-50 pointer-events-none" />

    
      <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center mb-5 z-10">
      
        <span className="text-indigo-500 flex items-center justify-center">
       
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </span>
      </div>

   
      <h3 className="font-bold text-gray-900 text-[17px] leading-snug mb-2">{title}</h3>

   
      <p className="text-gray-400 text-sm leading-relaxed mb-5">{description}</p>

    
      <ul className="flex flex-col gap-2 mb-6">
        {features.map((feat, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 5.2L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {feat}
          </li>
        ))}
      </ul>

      
      <div className="mt-auto pt-3 border-t border-gray-100">
        <button className="text-indigo-500 font-semibold text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all duration-200">
          {buttonLabel}
          {buttonIcon && <span>{buttonIcon}</span>}
        </button>
      </div>
    </div>
  );
};

export default Card;