import "./Hero.css";
import { NavLink } from "react-router-dom";
import { useRef, useEffect } from "react";
import gsap from "gsap";

export const Hero = () => {
  const badgeRef    = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef  = useRef(null);
  const imageRef    = useRef(null);
  const card1Ref    = useRef(null);
  const card2Ref    = useRef(null);

  useEffect(() => {
  
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(badgeRef.current,    { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(titleRef.current,    { opacity: 0, y: 40  }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.3")
        .fromTo(subtitleRef.current, { opacity: 0, y: 25  }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
        .fromTo(buttonsRef.current,  { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
        .fromTo(imageRef.current,    { opacity: 0, x: 50, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: 1 }, "-=0.8")
        .fromTo(card1Ref.current,    { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
        .fromTo(card2Ref.current,    { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")

        .add(() => {
          imageRef.current?.classList.add("hero-image-card--float");
        });


    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section py-4 px-15">
      <div className="hero-bg-blob hero-bg-blob--violet" />
      <div className="hero-bg-blob hero-bg-blob--teal" />
      <div className="hero-bg-blob hero-bg-blob--teal" />
      <div className="hero-dot-grid" />

      <div className="hero-inner p-10">
        <div className="hero-copy">
          <div ref={badgeRef} className="hero-badge">
            <span className="hero-badge__dot" />
            AI-POWERED LEARNING
          </div>

          <h1 ref={titleRef} className="hero-title">
            Powering smarter teaching and faster AI-driven mastery
            <span className="hero-title__accent">
             
              <svg className="hero-underline" viewBox="0 0 340 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8.5C60 3 140 1 200 4.5C240 7 290 9.5 338 6" stroke="#25c7b1" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          <p ref={subtitleRef} className="hero-subtitle">
            A unified, AI-powered ecosystem that adapts to every student’s pace and simplifies curriculum control for every instructor.
          </p>

          <div ref={buttonsRef} className="hero-actions">
            <NavLink to="/join" className="hero-btn-primary">
              Get Started
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </NavLink>
            <button className="hero-btn-secondary">
              <span className="hero-btn-secondary__play">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              How it Works
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-glow" />

          <div ref={imageRef} className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
              alt="Students learning with AI"
              className="hero-image"
            />
            <div className="hero-image-overlay" />
          </div>

          <div ref={card1Ref} className="hero-float-card hero-float-card--top">
            <div className="hero-float-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M9 12l2 2 4-4M12 3a9 9 0 110 18A9 9 0 0112 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="hero-float-card__text">
              <span className="hero-float-card__label">Verified Results</span>
              <span className="hero-float-card__sub">98% Success Rate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;