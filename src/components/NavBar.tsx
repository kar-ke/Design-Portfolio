export function NavBar() {
  return (
    <div 
      className="fixed bottom-0 left-0 w-full h-[60px] bg-[#000000] border-t border-white/5 z-[60] flex items-center justify-between px-8 md:px-12 opacity-0 pointer-events-none" 
      id="pinned-bar-bg"
      style={{ willChange: 'opacity' }}
    >
      <div className="h-full flex items-center gap-2">
        {/* Title on the left */}
        <span 
          id="nav-title" 
          className="font-serif text-xl md:text-2xl text-[#f4f0e6] opacity-0"
          style={{ willChange: 'opacity, transform', transform: 'translate3d(0, -360px, 0)' }}
        >
          Karthikeyan Ramesh <span className="italic">§</span>
        </span>
      </div>

      <div className="flex items-center gap-8 md:gap-12 pointer-events-auto">
        {['About', 'Work', 'Resume'].map((item) => (
          <a 
            key={item}
            href={`#${item.toLowerCase()}`}
            className="hidden md:block font-mono text-[10px] uppercase tracking-[0.3em] text-[#f4f0e6] opacity-60 hover:opacity-100 transition-opacity"
          >
            {item}
          </a>
        ))}
        <button className="px-6 py-2 bg-white text-black font-mono text-[10px] uppercase tracking-widest hover:bg-[#f4f0e6]/90 transition-colors">
          Contact me
        </button>
      </div>
    </div>
  );
}
