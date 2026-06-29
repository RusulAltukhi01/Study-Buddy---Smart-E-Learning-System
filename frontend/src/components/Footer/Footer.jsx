import Logo from "../../UI/Logo/Logo";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white px-4 py-12 md:px-8 border-t border-gray-200">
     
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-10 xl:gap-28 pb-12">
        
      
        <div className="w-full lg:max-w-xs text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="flex gap-x-2 items-center">
            <Logo color="dark-navy" />
          </div>
          <p className="mt-4 text-gray-500/80 text-sm leading-relaxed max-w-sm">
            Transform your learning experience with AI-powered tools.
          </p>
        </div>

       
        <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          
         
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[var(--electric-dark)] tracking-wider uppercase mb-5">
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              <li><NavLink to="/ai-tools" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>AI Tools</NavLink></li>
              <li><NavLink to="/instructors" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>For Instructors</NavLink></li>
              <li><NavLink to="/students" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>For Students</NavLink></li>
              <li><NavLink to="/pricing" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>Pricing</NavLink></li>
            </ul>
          </div>

      
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[var(--electric-dark)] tracking-wider uppercase mb-5">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              <li><NavLink to="/about" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>About</NavLink></li>
              <li><NavLink to="/blog" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>Blog</NavLink></li>
              <li><NavLink to="/careers" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>Careers</NavLink></li>
              <li><NavLink to="/contact" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>Contact</NavLink></li>
            </ul>
          </div>

  
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[var(--electric-dark)] tracking-wider uppercase mb-5">
              Legal
            </h3>
            <ul className="flex flex-col gap-3">
              <li><NavLink to="/privacy" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>Privacy Policy</NavLink></li>
              <li><NavLink to="/terms" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>Terms of Service</NavLink></li>
              <li><NavLink to="/cookies" className={({ isActive }) => `text-sm transition-colors duration-200 hover:text-[var(--electric)] ${isActive ? 'text-[var(--electric)] font-medium' : 'text-[var(--dark-navy)]'}`}>Cookie Policy</NavLink></li>
            </ul>
          </div>

        </div>
      </div>

     
      <div className="max-w-7xl mx-auto pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;