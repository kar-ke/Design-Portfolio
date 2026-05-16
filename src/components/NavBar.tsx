interface NavBarProps {
  // Drives internal state if needed
}

export function NavBar(_props: NavBarProps) {
  return (
    <div 
      id="pinned-bar-wrapper"
      className="fixed bottom-0 left-0 w-full z-[40] flex flex-col justify-end pointer-events-none"
    >
      <div 
        id="pinned-bar-bg"
        className="w-full bg-[#000000] border-t border-white/10 flex items-center opacity-0" 
        style={{ 
          willChange: 'opacity',
          height: '60px' 
        }}
      >
        <div 
          id="nav-content-normal"
          className="w-full h-full flex items-center justify-between px-8 md:px-12 pointer-events-auto transition-opacity duration-300"
        >
          <div className="flex items-center gap-2 py-1">
            <span 
              id="nav-title" 
              className="font-serif text-xl md:text-2xl text-[#e5e5e5] opacity-0"
              style={{ willChange: 'opacity, transform', transform: 'translate3d(0, -120px, 0) scale(1.4)' }}
            >
              Karthikeyan Ramesh <span className="italic">§</span>
            </span>
          </div>

          <div className="flex items-center gap-8 md:gap-12">
            {['About', 'Work', 'Resume'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hidden md:block font-sans text-[10px] uppercase tracking-[0.3em] text-[#e5e5e5] opacity-60 hover:opacity-100 transition-opacity font-medium"
              >
                {item}
              </a>
            ))}
            <button className="px-6 py-2 bg-[#e5e5e5] text-black font-sans text-[10px] uppercase tracking-widest hover:bg-white transition-colors font-medium">
              Contact me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
