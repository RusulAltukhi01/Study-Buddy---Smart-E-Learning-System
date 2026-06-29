import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NavLink } from "react-router-dom";
import aiToolsImg from "../../assets/robot-about.jpg";
import classImg from "../../assets/class.jpg";

gsap.registerPlugin(ScrollTrigger);

const TRIGGER_START = "top 95%";

const CARDS = [
  {
    img: aiToolsImg,
    imgAlt: "AI Tools Interface",
    accentBar: "from-purple-500 to-purple-400",
    accentText: "text-purple-600",
    accentBorder: "border-purple-100",
    accentBadgeBg: "bg-purple-50",
    btnClass: "bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-400",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
      </svg>
    ),
    badge: "AI Tools",
    title: "AI Productivity Suite",
    description: "Unlock efficiency with our advanced AI toolkit. Automate document summarization, and generate high-quality content instantly — streamlining every workflow.",
    btnLabel: "Explore AI Tools",
    btnTo: "/summary",
  },
  {
    img: classImg,
    imgAlt: "Learning Environment",
    accentBar: "from-teal-500 to-teal-400",
    accentText: "text-teal-600",
    accentBorder: "border-teal-100",
    accentBadgeBg: "bg-teal-50",
    btnClass: "bg-teal-500 hover:bg-teal-600 focus-visible:ring-teal-400",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
      </svg>
    ),
    badge: "Education",
    title: "Learning Ecosystem",
    description: "Comprehensive educational platform built for collaborative growth. Engage in structured learning paths, interactive assignments, and real-time feedback systems.",
    btnLabel: "Join Learning Platform",
    btnTo: "/signup",
  },
];

const About = () => {
  const headingRef  = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const cardsGridRef = useRef(null);
  const cardsRef    = useRef([]);

  const addToCardRefs = useCallback((el) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {


      gsap.fromTo(
        [titleRef.current, subtitleRef.current],
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headingRef.current, 
            start: TRIGGER_START,
            once: true,
          },
        }
      );


      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: cardsGridRef.current,
            start: TRIGGER_START,
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full min-h-screen py-16 sm:py-24 px-4 bg-white">

     
      <div ref={headingRef} className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
        <h1
          ref={titleRef}
          className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-5 leading-tight"
          style={{
            background: "linear-gradient(to left, #6366f1 0%, #2dd4be 50%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Tailored for Every Need
        </h1>
        <p ref={subtitleRef} className="text-base sm:text-lg text-slate-500 leading-relaxed">
          Whether you require powerful AI utilities for rapid productivity or a
          comprehensive learning ecosystem, we provide the perfect solution for
          your unique requirements.
        </p>
      </div>

      
      <div ref={cardsGridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {CARDS.map((card, i) => (
          <div
            key={i}
            ref={addToCardRefs}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col"
          >
            <div className="w-full h-48 sm:h-64 overflow-hidden">
              <img src={card.img} alt={card.imgAlt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"/>
            </div>

            <div className="flex flex-col flex-1 px-6 sm:px-8 pt-6 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${card.accentBadgeBg} ${card.accentText} border ${card.accentBorder}`}>
                  <span className={card.accentText}>{card.icon}</span>
                  {card.badge}
                </span>
              </div>
              <h2 className="font-bold text-xl sm:text-2xl text-gray-800 leading-snug">{card.title}</h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed flex-1">{card.description}</p>
              <div className={`h-0.5 w-12 rounded-full bg-gradient-to-r ${card.accentBar}`} />
            </div>

            <div className="px-6 sm:px-8 pb-8 pt-2">
              <NavLink to={card.btnTo} className="block w-full group">
                <button className={`relative overflow-hidden w-full py-3.5 rounded-xl text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg ${card.btnClass}`}>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden="true"/>
                  <span className="relative">{card.btnLabel}</span>
                </button>
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;