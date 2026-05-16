import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GlitchBox {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export const GlitchCursor = () => {
  const [boxes, setBoxes] = useState<GlitchBox[]>([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(0);

  // For the trailing effect
  const trailCount = 5;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const isOverLocalHide = !!target.closest('[data-hide-cursor]') && target.closest('[data-hide-cursor]') !== document.documentElement;
      const isGlobalHide = document.documentElement.getAttribute('data-hide-cursor') === 'true';
      
      setIsVisible(!isOverLocalHide && !isGlobalHide);

      // Random glitch boxes around mouse
      if (Math.random() > 0.7) {
        const id = counterRef.current++;
        const size = 2 + Math.floor(Math.random() * 2) * 2; 
        
        const newBox: GlitchBox = {
          id,
          x: e.clientX + (Math.random() - 0.5) * 60,
          y: e.clientY + (Math.random() - 0.5) * 60,
          size,
          color: Math.random() > 0.5 ? '#E5E5E5' : '#404040'
        };

        setBoxes(prev => [...prev.slice(-20), newBox]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div 
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ 
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.15s ease'
        }}
      >
        {/* Trailing pixels */}
        {[...Array(trailCount)].map((_, i) => (
          <motion.div
            key={`trail-${i}`}
            className="absolute bg-white/30 mix-blend-difference"
            style={{
              width: 3 + (i % 2) * 2,
              height: 3 + (i % 2) * 2
            }}
            animate={{ 
              x: mousePos.x - 2, 
              y: mousePos.y - 2 
            }}
            transition={{ 
              type: 'spring', 
              damping: 15 + i * 5, 
              stiffness: 200 - i * 30, 
              mass: 0.2 + i * 0.1 
            }}
          />
        ))}

        <AnimatePresence>
          {boxes.map(box => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, x: mousePos.x, y: mousePos.y }}
              animate={{ 
                opacity: [0, 0.8, 0], 
                x: box.x,
                y: box.y,
                scaleX: [1, 2, 0.5],
                scaleY: [1, 0.5, 1.5],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "linear" }}
              className="absolute"
              style={{
                width: box.size,
                height: box.size,
                backgroundColor: box.color,
                left: 0,
                top: 0,
                mixBlendMode: 'difference',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Main 8x8 square pixel cursor */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white pointer-events-none z-[9999] mix-blend-difference"
        animate={{ 
          x: mousePos.x - 4, 
          y: mousePos.y - 4,
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 500, mass: 0.1 }}
      />
    </>
  );
};
