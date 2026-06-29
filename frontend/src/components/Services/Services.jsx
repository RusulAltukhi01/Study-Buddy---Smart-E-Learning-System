import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


const DocumentIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-teal-500"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const SparkleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-violet-500"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-indigo-500"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckBadge = () => (
  <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5.2L4 7.5L8 3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);


const ServiceCard = ({
  icon,
  iconBg,
  title,
  description,
  features,
  buttonLabel,
  buttonIcon,
}) => (
  <div className="relative flex flex-col bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 w-full h-full shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-indigo-50 opacity-60 pointer-events-none" />
    <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-indigo-100 opacity-40 pointer-events-none" />
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center mb-5 z-10 ${iconBg}`}
    >
      {icon}
    </div>
    <h3 className="font-bold text-gray-700 text-[17px] leading-snug mb-2">
      {title}
    </h3>
    <p className="text-gray-400 text-sm leading-relaxed mb-5">{description}</p>
    <ul className="flex flex-col gap-2 mb-6">
      {features.map((feat, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
          <CheckBadge />
          {feat}
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-3 border-t border-gray-100">
      <button className="cursor-pointer font-semibold text-sm flex items-center gap-1.5 hover:gap-3 active:scale-95 transition-all duration-200 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">
        {buttonLabel}
        <span className="text-base leading-none">{buttonIcon}</span>
      </button>
    </div>
  </div>
);


const FeatCard = ({ title, description, headingColor, innerRef }) => (
  <div
    ref={innerRef}
    className="flex flex-col gap-1 w-full  my-2 bg-gray-50/60 px-4 py-3 rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
  >
    <h2 className={`font-semibold text-base ${headingColor}`}>{title}</h2>
    <span className="text-gray-400 text-sm">{description}</span>
  </div>
);


const CARDS = [
  {
    icon: <DocumentIcon />,
    iconBg: "bg-teal-50",
    title: "Smart Summarization",
    description:
      "Transform extensive academic papers and lecture notes into concise, actionable insights using our proprietary AI distilling engine.",
    features: ["Key Concept Extraction", "Automated Bibliography"],
    buttonLabel: "Explore Engine",
    buttonIcon: "→",
  },
  {
    icon: <SparkleIcon />,
    iconBg: "bg-violet-50",
    title: "Quiz Generator",
    description:
      "Convert any resource into interactive assessments. Challenge your understanding with AI-generated spaced repetition modules.",
    features: ["Source-Linked Answers", "Tailored Assessments"],
    buttonLabel: "Generate Now",
    buttonIcon: "⚡",
  },
  {
    icon: <UsersIcon />,
    iconBg: "bg-indigo-50",
    title: "Instructor-Student Workspace",
    description:
      "Empower instructors to easily manage course materials, monitor engagement, and provide instant, actionable feedback.",
    features: ["Centralized Class Management", "Performance Analytics"],
    buttonLabel: "Manage Lab",
    buttonIcon: "✦",
  },
];

const INSTRUCTOR_CARDS = [
  {
    title: "Course Management",
    description:
      "Build out structured paths with modular chapters, video lessons, and resources.",
  },
  {
    title: "Classroom Directory",
    description:
      "Keep track of active student enrollments, and student profiles.",
  },
  {
    title: "Grading & Feedback",
    description:
      "Streamline your workflow—distribute tasks, evaluate submissions, and leave grades.",
  },
  {
    title: "Smart Analytics",
    description:
      "Visualize overall class health, pinpoint struggling students, and track engagement.",
  },
];

const STUDENT_CARDS = [
  {
    title: "My Learning Hub",
    description:
      "Access all your enrolled courses, lectures, and study materials in one place.",
  },
  {
    title: "Progress Tracker",
    description:
      "Monitor your course completion rates and celebrate your learning milestones.",
  },
  {
    title: "Study Planner",
    description:
      "Stay on top of upcoming assignments, exam dates, and strict deadlines.",
  },
  {
    title: "Rewards & Badges",
    description:
      "Earn certificates and digital badges as you master new skills and courses.",
  },
];


const TRIGGER_START = "top 95%"; 

const Services = () => {
  const sectionRef = useRef(null); 
  const sectionLabelRef = useRef(null);
  const sectionTitleRef = useRef(null);
  const sectionSubtitleRef = useRef(null);
  const cardsGridRef = useRef(null); 
  const instructorSectionRef = useRef(null);
  const studentSectionRef = useRef(null);

  const cardsRef = useRef([]);
  const instructorCardsRef = useRef([]);
  const studentCardsRef = useRef([]);

  const addToCards = useCallback((el) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
  }, []);
  const addToInstructorCards = useCallback((el) => {
    if (el && !instructorCardsRef.current.includes(el))
      instructorCardsRef.current.push(el);
  }, []);
  const addToStudentCards = useCallback((el) => {
    if (el && !studentCardsRef.current.includes(el))
      studentCardsRef.current.push(el);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.fromTo(
        [
          sectionLabelRef.current,
          sectionTitleRef.current,
          sectionSubtitleRef.current,
        ],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionLabelRef.current,
            start: TRIGGER_START,
            once: true, 
          },
        },
      );


      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsGridRef.current, 
            start: TRIGGER_START,
            once: true,
          },
        },
      );

      cardsRef.current.forEach((card) => {
        const onEnter = () =>
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            duration: 0.25,
            ease: "power2.out",
          });
        const onLeave = () =>
          gsap.to(card, { y: 0, scale: 1, duration: 0.25, ease: "power2.out" });
        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        card._gsapEnter = onEnter;
        card._gsapLeave = onLeave;
      });


      gsap.fromTo(
        instructorSectionRef.current,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: instructorSectionRef.current,
            start: TRIGGER_START,
            once: true,
          },
        },
      );

      gsap.fromTo(
        instructorCardsRef.current,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: {
            trigger: instructorSectionRef.current, 
            start: TRIGGER_START,
            once: true,
          },
        },
      );

  
      gsap.fromTo(
        studentSectionRef.current,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: studentSectionRef.current,
            start: TRIGGER_START,
            once: true,
          },
        },
      );

      gsap.fromTo(
        studentCardsRef.current,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: {
            trigger: studentSectionRef.current,
            start: TRIGGER_START,
            once: true,
          },
        },
      );
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) {
          card.removeEventListener("mouseenter", card._gsapEnter);
          card.removeEventListener("mouseleave", card._gsapLeave);
        }
      });
      ctx.revert();
    };
  }, []);

  return (
    <section
     id="features-section"
      ref={sectionRef}
      className="w-full flex flex-col items-center justify-center px-4 sm:px-8 py-16 gap-10"
    >
    
      <div className="flex flex-col items-center gap-3 text-center max-w-2xl">
        <p
          ref={sectionLabelRef}
          className="text-[var(--electric-dark)] font-semibold text-sm uppercase tracking-widest"
        >
          AI-Powered tools
        </p>
        <h1
          ref={sectionTitleRef}
          className="text-gray-800 font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight"
        >
          Boost Your Productivity
        </h1>
        <p
          ref={sectionSubtitleRef}
          className="text-gray-500 text-sm sm:text-base leading-relaxed"
        >
          Leverage cutting-edge AI to study smarter, not harder. Our tools help
          you absorb and retain information faster.
        </p>
      </div>

     
      <div
        ref={cardsGridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl"
      >
        {CARDS.map((card, i) => (
          <div key={i} ref={addToCards}>
            <ServiceCard {...card} />
          </div>
        ))}
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl gap-x-8 sm:gap-x-12 lg:gap-x-20 gap-y-6 pt-10">
    
        <div ref={instructorSectionRef} className="flex flex-col">
          <span className="text-[var(--cyan-mint-dark)] font-semibold text-xs uppercase tracking-widest">
            For instructors
          </span>
          <h2 className="font-bold text-[var(--dark-navy)] text-2xl sm:text-3xl mt-1">
            Course Control
          </h2>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">
            Everything you need to create, and manage exceptional learning
            experiences.
          </p>
        </div>

        <div ref={studentSectionRef} className="flex flex-col mt-6 lg:mt-0">
          <span className="text-[var(--bright-purple)] font-semibold text-xs uppercase tracking-widest">
            For students
          </span>
          <h2 className="font-bold text-[var(--dark-navy)] text-2xl sm:text-3xl mt-1">
            Learn Your Way
          </h2>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">
            Stay organized, track your progress, and achieve your learning
            goals.
          </p>
        </div>

      
        <hr className="w-full border-gray-100 lg:hidden col-span-1" />
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-4 lg:grid-flow-col gap-x-8 sm:gap-x-12 lg:gap-x-20 col-span-1 lg:col-span-2">
         
          {INSTRUCTOR_CARDS.map((c, i) => (
            <FeatCard
              key={`inst-${i}`}
              title={c.title}
              description={c.description}
              headingColor="text-[var(--cyan-mint-dark)]"
              innerRef={addToInstructorCards}
            />
          ))}

        
          {STUDENT_CARDS.map((c, i) => (
            <FeatCard
              key={`stud-${i}`}
              title={c.title}
              description={c.description}
              headingColor="text-[var(--bright-purple)]"
              innerRef={addToStudentCards}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
