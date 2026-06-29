import React, { useEffect, useState } from "react";
import { NavLink, useLocation,Link } from "react-router-dom";
import Logo from "../../UI/Logo/Logo";
import { useAuth } from "../../contexts/AuthContext";
import MobileNav from "../MobileNav/MobileNav";
import { Menu, X } from "lucide-react";
import defaultAvatar from "../../assets/default-avatar.png";
import NotificationBell from "../NotificationBell/NotificationBell";
import { HashLink } from "react-router-hash-link";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Header = () => {
  const { user, logout } = useAuth();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };

    const handleScroll = () => setScrolled(window.scrollY > 8);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getImageUrl = () => {
    if (!user?.profilePicture) return defaultAvatar;
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const imagePath = user.profilePicture.startsWith("/")
      ? user.profilePicture
      : `/${user.profilePicture}`;
    return `${baseUrl}${imagePath}`;
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3.5 py-1.5 rounded-lg text-md font-semibold transition-all duration-150 ${
      isActive
        ? "text-teal-600 bg-teal-50 after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-0.5 after:bg-teal-500 after:rounded-full"
        : "text-gray-500 hover:text-teal-600 hover:bg-teal-50"
    }`;

    const location = useLocation();

const isHomeActive = location.pathname === "/" && location.hash !== "#features-section";
  

  const isAboutActive = location.hash === "#features-section";
  return (
    <>
      <div />

      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white/85 backdrop-blur-md border-b py-5 border-black/[0.06] transition-shadow duration-200 ${
          scrolled ? "shadow-[0_2px_20px_rgba(13,148,136,0.10)]" : ""
        }`}
      >
        <nav className="flex items-center justify-between h-16 px-8 w-full">
          
          <div className="flex items-center flex-shrink-0">
            <Logo color="dark-navy" />
          </div>

     
          {!isMobile && (
            <ul className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 font-semibold">
              <li>
        <Link 
          to="/" 
          className={navLinkClass({ isActive: isHomeActive })}
        >
          Home
        </Link>
      </li>


      <li>
        <HashLink
          smooth
          to="/#features-section"
          className={navLinkClass({ isActive: isAboutActive })}
        >
          About
        </HashLink>
      </li>
              <li>
                <NavLink to="/summary" className={navLinkClass}>
                  Tools
                </NavLink>
              </li>
            </ul>
          )}

        
          <div className="flex items-center gap-2">
            {user ? (
              <>
               
                {!isMobile && (
                  <NavLink to={`/${user.role}/profile`} title="Go to profile">
                    <img
                      src={getImageUrl()}
                      crossOrigin="anonymous"
                      className="w-10 h-10 rounded-full border-2 border-teal-500 object-cover hover:ring-2 hover:ring-teal-300 transition-all"
                    />
                  </NavLink>
                )}

             
                <NotificationBell classroomIds={user.classrooms || []} />

                {!isMobile && (
                  <button
                    onClick={logout}
                    className="ml-1 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all duration-150"
                  >
                    Logout
                  </button>
                )}

           
                {isMobile && (
                  <button
                    onClick={() => setIsMobileMenuOpen((p) => !p)}
                    className="p-2 rounded-lg hover:bg-teal-50 transition-colors"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X color="#0d9488" size={22} />
                    ) : (
                      <Menu color="#0d9488" size={22} />
                    )}
                  </button>
                )}
              </>
            ) : (
              <>
                {!isMobile ? (
                  <>
                    <NavLink to="/login">
                      <button className="px-4 py-1.5 text-sm font-semibold text-teal-600 border border-teal-500 rounded-lg hover:bg-teal-50 transition-all">
                        Login
                      </button>
                    </NavLink>
                    <NavLink to="/signup">
                      <button className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-all">
                        Sign up
                      </button>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={() => setIsMobileMenuOpen((p) => !p)}
                    className="p-2 rounded-lg hover:bg-teal-50 transition-colors"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X color="#0d9488" size={22} />
                    ) : (
                      <Menu color="#0d9488" size={22} />
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </nav>

        
        {isMobile && isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <MobileNav
              onClose={() => setIsMobileMenuOpen(false)}
              logout={logout}
            />
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
