/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { NavBar } from './components/NavBar';

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
    // Bolder, more futuristic and distinct character set
    const chars = '█▓▒░$#@&*!+=<>:· }';
    const charWidth = 9;
    const charHeight = 11;

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
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cols = Math.ceil(canvas.width / charWidth);
      const rows = Math.ceil(canvas.height / charHeight);

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      // ASCII is visible immediately in the hero section now
      const revealOpacity = 1;

      if (revealOpacity > 0) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const posX = x * charWidth + charWidth / 2;
            const posY = y * charHeight + charHeight / 2;

            const dx = mouseRef.current.x - posX;
            const dy = mouseRef.current.y - posY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const mouseEffect = Math.max(0, 1 - dist / 150);
            
            // Adjusted noise function for slightly denser and more dynamic pattern
            const noise1 = Math.sin(x * 0.1 + y * 0.15 + time * 0.0008 + scrollY * 0.004);
            const noise2 = Math.cos(x * 0.2 - y * 0.1 + time * 0.0012);
            const baseIntensity = (noise1 + noise2 + 2) / 4; 
            
            const finalIntensity = Math.max(0, baseIntensity * (1 - mouseEffect * 1.2));
            const charIndex = Math.floor(finalIntensity * (chars.length - 1));
            
            // Refined "cyber/editorial" color values - premium white/off-white palette
            const r = 250 - (mouseRef.current.x / canvas.width) * 30;
            const g = 245 - (mouseRef.current.y / canvas.height) * 30;
            const b = 235;
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            // Increased base opacity for bold visibility
            ctx.globalAlpha = Math.min((0.15 + mouseEffect * 0.7) * revealOpacity, 1);
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
    // Switch to a softer easing curve for smoother, less aggressive acceleration
    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const handleScroll = () => {
      if (!isMounted) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      // Slow down the entire hero animation by stretching it over 1.3x viewport height
      const progress = Math.min(Math.max(scrollY / (vh * 1.3), 0), 1);
      setScrollProgress(progress);

      // Shared easing for physical movement synchronization
      // Starts immediately from initial scroll using a smoother quad easing
      const motionProgress = easeInOutQuad(progress);

      // 1. Subtext Fade - lingers longer for softer fade (0 to 0.5)
      if (subtextRef.current) {
        const subtextFadeProgress = Math.min(progress / 0.5, 1);
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
        // Navbar is fixed at bottom. Title starts at top.
        const isMobile = window.innerWidth < 768;
        const topPadding = isMobile ? 32 : 48; // Approximate px value of pt-8 and pt-12
        const targetTranslateY = vh - topPadding - 50; 
        const currentTranslateY = targetTranslateY * motionProgress;
        
        // Origin is top left, moving down and scaling together
        titleRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0) scale(${currentScale})`;
        
        // Fade out progressively starting earlier (from 0.4 to 0.7) to dissolve smoothly above the navbar
        const titleFadeProgress = Math.min(Math.max((progress - 0.4) / 0.3, 0), 1);
        titleRef.current.style.opacity = (1 - easeInOutQuad(titleFadeProgress)).toString();
      }

      // 3. Nav Title Slide-In
      const navTitle = document.getElementById('nav-title');
      if (navTitle) {
        // Fades in from 0.45 to 0.75 to match the earlier hero title fade
        const navTitleProgress = Math.min(Math.max((progress - 0.45) / 0.3, 0), 1);
        const navFadeEased = easeInOutQuad(navTitleProgress);
        
        navTitle.style.opacity = navFadeEased.toString();
        // Emerges from higher above the navbar and settles downward
        const startOffset = -360;
        const currentNavOffset = startOffset * (1 - navFadeEased);
        navTitle.style.transform = `translate3d(0, ${currentNavOffset}px, 0)`;
      }

      // 4. Background and Interaction for Bottom Nav
      const bg = document.getElementById('pinned-bar-bg');
      if (bg) {
        const bgProgress = Math.min(Math.max((progress - 0.6) / 0.4, 0), 1);
        bg.style.opacity = easeOutQuart(bgProgress).toString();
        bg.style.pointerEvents = progress > 0.8 ? 'auto' : 'none';
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
    <div ref={containerRef} className="relative min-h-[300vh] bg-[#000000] selection:bg-[#f4f0e6] selection:text-[#000000]">
      {/* Fixed Animated Headline Container */}
      <div 
        id="hero-headline"
        className="fixed left-0 top-0 pt-8 md:pt-12 px-8 md:px-12 z-50 w-full text-left pointer-events-none"
      >
        <div className="max-w-[1400px]">
          <div ref={titleRef} className="relative inline-block origin-top-left" style={{ willChange: 'transform, opacity' }}>
            <h1 className="font-serif text-[200px] md:text-[12vw] font-normal tracking-tight leading-[0.85] text-[#f4f0e6]">
              Karthikeyan<br />
              <div className="flex items-baseline gap-4 md:gap-12">
                Ramesh
                <span className="text-[12vw] md:text-[6vw] italic font-serif opacity-80 translate-y-[-10%] inline-block">§</span>
              </div>
            </h1>
          </div>
          
          <p ref={subtextRef} className="subtext font-serif text-lg md:text-3xl italic tracking-tight opacity-90 mt-8 md:mt-12 text-[#f4f0e6] max-w-full md:max-w-2xl leading-[1.2] lowercase" style={{ willChange: 'opacity, filter' }}>
            makes emotionally intelligent design that starts human and moves outward
          </p>
        </div>
      </div>

      {/* Sections 1 & 2: Hero & ASCII Background combined */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <DynamicAscii />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              // Soft black gradients on top and bottom for cinematic blending
              backgroundImage: 'linear-gradient(to bottom, #000000 0%, transparent 20%, transparent 80%, #000000 100%)'
            }}
          />
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="relative min-h-screen bg-[#ffffff] text-[#000000] py-32 px-8 md:px-12 z-20" id="works">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-baseline gap-4 mb-20">
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Featured Projects
            </h2>
            <span className="font-serif text-2xl italic opacity-50">§</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-16">
            {[
              { id: 1, title: 'Project One', tags: ['UI/UX', 'Web Design'], img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2400&auto=format&fit=crop' },
              { id: 2, title: 'Project Two', tags: ['Branding', 'Art Direction'], img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2400&auto=format&fit=crop' },
              { id: 3, title: 'Project Three', tags: ['Illustration', 'Animation'], img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2400&auto=format&fit=crop' },
              { id: 4, title: 'Project Four', tags: ['UI/UX', 'Mobile App'], img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2400&auto=format&fit=crop' }
            ].map((project) => (
              <div key={project.id} className="group cursor-pointer flex flex-col gap-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0f0f0]">
                  <div className="absolute inset-0 bg-[#000000]/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={project.img} 
                    alt={project.title}
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t border-[#000000]/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl tracking-tight">{project.title}</h3>
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0">
                      View Project &rarr;
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {project.tags.map(tag => (
                      <span key={tag} className="font-mono text-[9px] uppercase tracking-widest text-[#000000]/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NavBar />
    </div>
  );
}

