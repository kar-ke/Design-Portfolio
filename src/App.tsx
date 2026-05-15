/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function DynamicAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    const chars = '█▓▒░$#@*!=+-:· ';
    const charWidth = 10;
    const charHeight = 12;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '11px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cols = Math.ceil(canvas.width / charWidth);
      const rows = Math.ceil(canvas.height / charHeight);

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const scrollProgress = Math.min(Math.max(scrollY / vh, 0), 1);
      
      // Calculate overall reveal based on scroll
      // Reveal starts around progress 0.1 and becomes full at 0.5
      const revealOpacity = Math.min(Math.max((scrollProgress - 0.1) / 0.4, 0), 1);

      if (revealOpacity > 0) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const posX = x * charWidth + charWidth / 2;
            const posY = y * charHeight + charHeight / 2;

            const dx = mouseRef.current.x - posX;
            const dy = mouseRef.current.y - posY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const mouseEffect = Math.max(0, 1 - dist / 150);
            
            const noise = Math.sin(x * 0.1 + y * 0.2 + time * 0.001 + scrollY * 0.005);
            const baseIntensity = (noise + 1) / 2; 
            
            const finalIntensity = Math.max(0, baseIntensity * (1 - mouseEffect * 1.5));
            const charIndex = Math.floor(finalIntensity * (chars.length - 1));
            
            const r = 244 - (mouseRef.current.x / canvas.width) * 40;
            const g = 240 - (mouseRef.current.y / canvas.height) * 40;
            const b = 230;
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.globalAlpha = (0.02 + mouseEffect * 0.45) * revealOpacity;
            ctx.fillText(chars[charIndex], posX, posY);
          }
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number;
    let isMounted = true;

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const handleScroll = () => {
      if (!isMounted) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      const progress = Math.min(Math.max(scrollY / vh, 0), 1);
      setScrollProgress(progress);

      // Shared easing for physical movement synchronization
      const motionProgress = easeInOutCubic(progress);

      // 1. Subtext Fade (0 to 0.25) - fades early to reduce visual noise
      if (subtextRef.current) {
        const subtextFadeProgress = Math.min(progress / 0.25, 1);
        const subtextOpacity = 1 - easeOutQuart(subtextFadeProgress);
        subtextRef.current.style.opacity = subtextOpacity.toString();
        subtextRef.current.style.filter = `blur(${easeOutQuart(subtextFadeProgress) * 12}px)`;
      }

      // 2. Main Title morph (Scale, Translate, Opacity)
      if (titleRef.current) {
        // Synchronized physical scaling and translation
        // Target scale around 0.15 to roughly match nav title size
        const currentScale = 1 - (motionProgress * 0.85); 
        
        // Target is center of the bottom navbar
        const targetTranslateY = (vh * 0.5) - 40; 
        const currentTranslateY = targetTranslateY * motionProgress;
        
        // Origin is left, moving down and scaling together
        titleRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0) scale(${currentScale})`;
        
        // Fade out smoothly between 0.65 and 0.95 to match nav title fade-in perfectly
        const crossfadeProgress = Math.min(Math.max((progress - 0.65) / 0.3, 0), 1);
        titleRef.current.style.opacity = (1 - easeOutQuart(crossfadeProgress)).toString();
      }

      // 3. Nav Title Slide-In
      const navTitle = document.getElementById('nav-title');
      if (navTitle) {
        // Crossfade with main title: fades in between 0.65 and 0.95
        const crossfadeProgress = Math.min(Math.max((progress - 0.65) / 0.3, 0), 1);
        const navFadeEased = easeOutQuart(crossfadeProgress);
        
        navTitle.style.opacity = navFadeEased.toString();
        // Locks position exactly to the hero title's physical center during the entire motion
        const targetTranslateY = (vh * 0.5) - 40; 
        const currentNavOffset = -targetTranslateY * (1 - motionProgress);
        navTitle.style.transform = `translate3d(0, ${currentNavOffset}px, 0)`;
      }

      // 4. Background and Interaction for Bottom Nav
      const bg = document.getElementById('pinned-bar-bg');
      if (bg) {
        const bgProgress = Math.min(Math.max((progress - 0.6) / 0.4, 0), 1);
        bg.style.opacity = easeOutQuart(bgProgress).toString();
        bg.style.pointerEvents = progress > 0.8 ? 'auto' : 'none';
      }

      // 5. Scroll Indicator Fade
      const scrollInd = document.getElementById('scroll-indicator');
      if (scrollInd) {
        const indProgress = Math.min(progress / 0.2, 1);
        scrollInd.style.opacity = (1 - easeOutQuart(indProgress)).toString();
      }

      rafId = requestAnimationFrame(handleScroll);
    };

    rafId = requestAnimationFrame(handleScroll);

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] bg-[#151411] selection:bg-[#f4f0e6] selection:text-[#151411]">
      {/* Fixed Animated Headline Container */}
      <div 
        id="hero-headline"
        className="fixed left-0 top-1/2 z-50 w-full -translate-y-1/2 text-left pointer-events-none px-8 md:px-24"
      >
        <div className="max-w-[1400px]">
          <div ref={titleRef} className="relative inline-block origin-left" style={{ willChange: 'transform, opacity' }}>
            <h1 className="font-serif text-[12vw] md:text-[10vw] font-normal tracking-tight leading-[0.85] text-[#f4f0e6]">
              Patchwork<br />
              <div className="flex items-baseline gap-4 md:gap-12 ml-[0.3em] md:ml-[0.8em]">
                Design
                <span className="text-[10vw] md:text-[5vw] italic font-serif opacity-80 translate-y-[-10%] inline-block">§</span>
              </div>
            </h1>
          </div>
          
          <p ref={subtextRef} className="subtext font-serif text-lg md:text-3xl italic tracking-tight opacity-90 mt-12 text-[#f4f0e6] max-w-full md:max-w-2xl leading-[1.2] lowercase" style={{ willChange: 'opacity, filter' }}>
            makes emotionally intelligent design that starts human and moves outward
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div id="scroll-indicator" className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 opacity-40 transition-opacity duration-500" style={{ willChange: 'opacity' }}>
        <div className="w-[1px] h-12 bg-[#f4f0e6] origin-top animate-scroll-line"></div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#f4f0e6]">Scroll</span>
      </div>

      {/* Section 1: Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center">
        {/* We keep this empty as the visual 'centered' title is fixed above */}
      </section>

      {/* Section 2: ASCII Scroll Fold */}
      <section className="relative h-screen overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <DynamicAscii />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              backgroundImage: 'linear-gradient(to bottom, transparent, #0c0c0c 95%)'
            }}
          />
        </div>
        
        <div 
          className="relative z-10 h-full flex flex-col items-start justify-center px-12 md:px-24 max-w-5xl"
          style={{ 
            transform: `translateY(${(1 - scrollProgress) * 100}px)`,
            opacity: Math.min(Math.max((scrollProgress - 0.4) * 2, 0), 1)
          }}
        >
          <div className="flex items-center gap-4 mb-12 opacity-50">
            <span className="font-mono text-sm">02</span>
            <div className="w-12 h-[1px] bg-white"></div>
            <span className="font-sans text-xs uppercase tracking-widest">Architecture</span>
          </div>
          <h2 className="font-display text-4xl md:text-7xl font-bold mb-10 tracking-tight">
            The beauty of the <br/><span className="text-white/40 italic">raw pattern.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans text-lg opacity-80 leading-relaxed max-w-4xl">
            <p>
              In a world of polished pixels, we celebrate the structure beneath. 
              The ASCII grid represents the skeleton of computation—a dense patchwork 
              of characters defining space and form.
            </p>
            <p>
              Scrolling reveals the depth of the canvas. Every character is a choice, 
              every gap is a pause. This experience is designed to be felt in the 
              motion of the thumb and the sync of the frame.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Extra Scroll Space to show pinned behavior */}
      <section className="relative h-screen flex items-center justify-center bg-[#f4f0e6] text-[#151411]">
        <div className="text-center opacity-40 hover:opacity-100 transition-opacity duration-700 cursor-default">
          <p className="font-serif text-4xl italic mb-4">The end of the fold.</p>
          <p className="font-mono text-xs uppercase tracking-[0.5em]">Crafted by Design</p>
        </div>
      </section>

      {/* Bottom Nav Bar */}
      <div 
        className="fixed bottom-0 left-0 w-full h-20 bg-[#151411] border-t border-white/5 z-[60] flex items-center justify-between px-8 md:px-12 opacity-0 pointer-events-none" 
        id="pinned-bar-bg"
        style={{ willChange: 'opacity' }}
      >
        <div className="flex items-center gap-2">
          {/* Title on the left */}
          <span 
            id="nav-title" 
            className="font-serif text-xl md:text-2xl text-[#f4f0e6] opacity-0"
            style={{ willChange: 'opacity, transform', transform: 'translate3d(0, -60px, 0)' }}
          >
            Patchwork Design <span className="italic">§</span>
          </span>
        </div>

        <div className="flex items-center gap-8 md:gap-12 pointer-events-auto">
          {['About', 'Works', 'Resume'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#f4f0e6] opacity-60 hover:opacity-100 transition-opacity"
            >
              {item}
            </a>
          ))}
          <button className="hidden md:block px-6 py-2 border border-[#f4f0e6]/20 font-mono text-[10px] uppercase tracking-widest text-[#f4f0e6] hover:bg-[#f4f0e6] hover:text-[#151411] transition-all">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

