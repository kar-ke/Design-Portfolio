/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { motion } from 'motion/react';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { DynamicAscii } from './components/DynamicAscii';
import { Toast } from './components/Toast';
import { GlitchCursor } from './components/GlitchCursor';
import { useScrollAnimations } from './hooks/useScrollAnimations';

export default function App() {
  const titleRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const asciiRef = useRef<HTMLDivElement>(null);

  useScrollAnimations({ titleRef, subtextRef, asciiRef });

  const projects = [
    { id: 1, title: 'Project One', tags: ['UI/UX', 'Web Design'], img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2400&auto=format&fit=crop' },
    { id: 2, title: 'Project Two', tags: ['Branding', 'Art Direction'], img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2400&auto=format&fit=crop' },
    { id: 3, title: 'Project Three', tags: ['Illustration', 'Animation'], img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2400&auto=format&fit=crop' },
    { id: 4, title: 'Project Four', tags: ['UI/UX', 'Mobile App'], img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2400&auto=format&fit=crop' }
  ];

  return (
    <div className="relative min-h-[350vh] bg-[#000000] selection:bg-[#e5e5e5] selection:text-[#000000]" data-custom-cursor="true">
      <GlitchCursor />
      <Toast />
      {/* Fixed Animated Headline Container */}
      <div 
        id="hero-headline"
        className="fixed left-0 top-0 pt-8 md:pt-12 px-8 md:px-12 z-50 w-full text-left pointer-events-none"
      >
        <div className="max-w-[1400px]">
          <div ref={titleRef} className="relative inline-block origin-top-left" style={{ willChange: 'transform, opacity' }}>
            <h1 className="font-serif text-[80px] md:text-[11vw] font-normal tracking-tight leading-[0.8] text-[#E5E5E5]">
              Karthikeyan<br />
              <div className="flex items-baseline gap-4 md:gap-12">
                Ramesh
                <span className="text-[6vw] md:text-[4vw] italic font-serif translate-y-[-10%] inline-block text-[#E5E5E5]">§</span>
              </div>
            </h1>
          </div>
          
          <div className="mt-8 md:mt-12">
            <p ref={subtextRef} className="subtext font-geist font-light text-lg md:text-[1.8vw] lg:text-[1.6vw] tracking-tight text-[#E5E5E5] max-w-4xl leading-relaxed" style={{ willChange: 'opacity, filter' }}>
              Product Designer with 2+ years of experience designing web and mobile products across fantasy sports, logistics, SaaS, and internal tools.
            </p>
          </div>
        </div>
      </div>

      {/* Sections 1 & 2: Hero & ASCII Background combined */}
      <section className="relative h-[200vh]">
        <div ref={asciiRef} className="sticky top-0 h-screen overflow-hidden" style={{ willChange: 'opacity, transform' }}>
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
            {projects.map((project, index) => (
              <motion.div 
                key={project.id} 
                className="group cursor-pointer flex flex-col gap-6"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.8, 
                    delay: (index % 2) * 0.2,
                    ease: [0.215, 0.61, 0.355, 1] 
                  }
                }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0f0f0]">
                  <div className="absolute inset-0 bg-[#000000]/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <motion.img 
                    src={project.img} 
                    alt={project.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t border-[#000000]/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl tracking-tight">{project.title}</h3>
                    <span className="font-sans text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0 font-medium">
                      View Project &rarr;
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {project.tags.map(tag => (
                      <span key={tag} className="font-sans text-[9px] uppercase tracking-widest text-[#000000]/50 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Bottom solid separation */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-black/10 pointer-events-none" />
      </section>


      {/* Quote Section */}
      <section className="bg-[#ffffff] py-48 px-8 md:px-12 relative overflow-hidden border-t border-black/5">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="font-geist text-black text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[1.1] max-w-5xl mx-auto font-light">
            <span className="opacity-30">Great design isn't about</span> polish, <br className="hidden md:block" />
            <span className="opacity-30">it's about</span> solving the right problem <br className="hidden md:block" />
            <span className="opacity-30">in the</span> right way.
          </h2>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#ffffff] py-32 px-8 md:px-12 pb-48 border-b border-black/5" id="about">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl bg-[#f5f5f5]">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2400&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale brightness-110 contrast-[1.1] hover:grayscale-0 hover:brightness-100 transition-all duration-1000 ease-out" 
              alt="Portrait" 
            />
            {/* Added subtle grain overlay for premium feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </div>
          <div className="flex flex-col gap-12 text-black">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-black/10 text-[10px] uppercase tracking-[0.2em] font-semibold bg-black/5 mb-10">
                About
              </span>
              <h3 className="font-geist text-5xl md:text-6xl lg:text-[5.5vw] tracking-tighter leading-[0.9] font-light">
                Mastering <span className="font-serif italic opacity-70">Design</span> by Day, <br />
                <span className="font-serif italic opacity-70">Discipline</span> by Night
              </h3>
            </div>
            <div className="flex flex-col gap-8 text-lg md:text-xl text-black/60 leading-relaxed max-w-xl font-geist font-light">
              <p>
                UI/UX designer with a BCA background, merging technical skills with human-centered design. I specialize in turning complex problems into intuitive apps and websites—like simplifying fintech for seniors or crafting sleek e-commerce experiences.
              </p>
              <p className="text-black font-normal italic opacity-90 border-l-2 border-black/10 pl-6">
                Fun Fact - When I'm not wireframing, I'm chasing PRs at the gym.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <NavBar />
    </div>
  );
}

