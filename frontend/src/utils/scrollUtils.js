import gsap from "gsap";

export const scrollToSection = (element, offset = 80) => {
  if (!element) return;
  
  gsap.to(window, {
    duration: 1.5,
    scrollTo: {
      y: element,
      offsetY: offset, 
    },
    ease: "power2.inOut",
  });
};


export const smoothScrollTo = (target, options = {}) => {
  const {
    duration = 1.5,
    offset = 80,
    ease = "power2.inOut",
    onComplete = null
  } = options;
  
  gsap.to(window, {
    duration,
    scrollTo: {
      y: target,
      offsetY: offset,
    },
    ease,
    onComplete,
  });
};