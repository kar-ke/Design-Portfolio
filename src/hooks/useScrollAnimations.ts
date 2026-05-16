import { useEffect, RefObject } from 'react';

interface ScrollAnimationProps {
  titleRef: RefObject<HTMLDivElement>;
  subtextRef: RefObject<HTMLParagraphElement>;
  asciiRef: RefObject<HTMLDivElement>;
}

export function useScrollAnimations({ titleRef, subtextRef, asciiRef }: ScrollAnimationProps) {
  useEffect(() => {
    let rafId: number;
    let isMounted = true;

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const handleScroll = () => {
      if (!isMounted) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      // Hero animation occurs over 1.0x viewport height
      const progress = Math.min(Math.max(scrollY / (vh * 1.0), 0), 1);

      // Shared easing for physical movement synchronization
      const motionProgress = easeInOutQuad(progress);

      // 1. Subtext Fade
      if (subtextRef.current) {
        const subtextFadeProgress = Math.min(progress / 0.5, 1);
        const subtextOpacity = 1 - easeOutQuart(subtextFadeProgress);
        subtextRef.current.style.opacity = subtextOpacity.toString();
        subtextRef.current.style.filter = `blur(${easeOutQuart(subtextFadeProgress) * 12}px)`;
      }

      // 2. Main Title morph
      if (titleRef.current) {
        const currentScale = 1 - (motionProgress * 0.825); 
        const isMobile = window.innerWidth < 768;
        const topPadding = isMobile ? 32 : 48;
        const targetTranslateY = vh - topPadding - 42; 
        const currentTranslateY = targetTranslateY * motionProgress;
        titleRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0) scale(${currentScale})`;
        
        // Start fading at 60% progress, finish at 92% (100px-ish above nav)
        const titleFadeProgress = Math.min(Math.max((progress - 0.6) / 0.32, 0), 1);
        titleRef.current.style.opacity = (1 - easeInOutQuad(titleFadeProgress)).toString();
      }

      // 3. Nav Title Slide-In
      const navTitle = document.getElementById('nav-title');
      if (navTitle) {
        // Triggered in sync with previous title fade-out
        const navTitleProgress = Math.min(Math.max((progress - 0.72) / 0.24, 0), 1);
        const navEased = easeInOutQuad(navTitleProgress);
        
        // Progressively reveal as it moves up
        navTitle.style.opacity = navEased.toString();
        
        // Rise or fall? User wants "top to bottom"
        const startY = -120;
        const currentY = startY * (1 - navEased);
        
        // Scale down from 1.4x to 1x
        const startScale = 1.4;
        const currentScale = startScale - (startScale - 1) * navEased;
        
        // Apply subtle motion blur during the transition
        const blurAmount = (1 - navEased) * navEased * 4; // Peaks at 0.5 progress
        
        navTitle.style.transform = `translate3d(0, ${currentY}px, 0) scale(${currentScale})`;
        navTitle.style.filter = blurAmount > 0.1 ? `blur(${blurAmount}px)` : 'none';
      }

      // 4. Navbar Visibility
      const bg = document.getElementById('pinned-bar-bg');
      if (bg) {
        // Gradual opacity reveal synchronized with the end of the scroll trigger
        const showStart = 0.80;
        const showEnd = 0.98;
        const showProgress = Math.min(Math.max((progress - showStart) / (showEnd - showStart), 0), 1);
        const gradualOpacity = easeInOutQuad(showProgress);
        
        bg.style.opacity = gradualOpacity.toString();
        bg.style.pointerEvents = gradualOpacity > 0.1 ? 'auto' : 'none';

        // Manage global cursor hiding for ASCII section specifically
        // Visible in Hero (Fold 1), Hidden in ASCII (Fold 2), Visible in rest of site
        const isASCII = scrollY >= vh * 0.98 && scrollY < vh * 1.95;

        if (isASCII) {
          document.documentElement.setAttribute('data-hide-cursor', 'true');
        } else {
          document.documentElement.removeAttribute('data-hide-cursor');
        }
      }

      // 5. ASCII Background Reveal
      if (asciiRef.current) {
        // Start revealing early and sync with hero scale down duration
        const revealStart = 0.1;
        const revealEnd = 1.0;
        const asciiProgress = Math.min(Math.max((progress - revealStart) / (revealEnd - revealStart), 0), 1);
        const easeProgress = easeInOutQuad(asciiProgress);
        
        // Remove opacity reveal - stay fully opaque
        asciiRef.current.style.opacity = '1';
        
        // Slide up effect from 100vh to 0px
        const translateY = (1 - easeProgress) * vh;
        asciiRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      rafId = requestAnimationFrame(handleScroll);
    };

    rafId = requestAnimationFrame(handleScroll);

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [titleRef, subtextRef]);
}
