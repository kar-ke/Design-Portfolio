import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Cell {
  baseAlpha: number;
  alpha: number;
  colorIdx: number;
  flickTimer: number;
  flickInterval: number;
  isSparseHighlight?: boolean;
}

interface Block {
  baseX: number;
  baseY: number;
  patIdx: number;
  connAlpha: number;
  cells: Cell[][];
  palette: string[];
  driftX: number;
  driftY: number;
  vx: number;
  vy: number;
  generation?: number;
}

export function DynamicAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    blocks: Block[][];
    trail: Point[];
    scrollX: number;
    mouseX: number;
    mouseY: number;
    mouseActive: boolean;
    globalFade: number;
    lastTime: number;
    lastMove: number;
    currentBlockW: number;
    currentBlockH: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CHAR_W = 6;
    const CHAR_H = 10;
    const CHARS_PER_COL = 12;
    const CHARS_PER_ROW = 14;
    const PAD = 20;
    const PALETTES = [
      ['#1c0e04', '#2e1808', '#42220c', '#562c10', '#6a3814'],
      ['#10091c', '#1c1030', '#281844', '#342058', '#40286c'],
      ['#050f1a', '#091828', '#0d2236', '#112c46', '#153656'],
      ['#1a0608', '#2c0e10', '#3e1418', '#521c22', '#66242c'],
      ['#08120a', '#101e10', '#182c18', '#203a20', '#284a28'],
      ['#140810', '#22101e', '#30182c', '#3e203a', '#4e2848'],
      ['#1a1006', '#2c1c0a', '#3e280e', '#523614', '#664418'],
    ];

    const randomizeBlock = (block: Partial<Block>) => {
      const pIdx = Math.floor(Math.random() * 32);
      block.patIdx = pIdx;
      block.palette = PALETTES[pIdx % 7];
      block.vx = (Math.random() - 0.5) * 0.22;
      block.vy = (Math.random() - 0.5) * 0.22;
      block.driftX = 0;
      block.driftY = 0;
      block.connAlpha = 0;

      const colColors = Array.from({ length: CHARS_PER_COL }, () => Math.floor(Math.random() * 5));
      const cells: Cell[][] = [];
      for (let row = 0; row < CHARS_PER_ROW; row++) {
        cells[row] = [];
        for (let col = 0; col < CHARS_PER_COL; col++) {
          let baseAlpha = 0.0;
          if (pIdx === 0) baseAlpha = 0.72;
          else if (pIdx === 1) baseAlpha = 0.15 + 0.75 * (row / (CHARS_PER_ROW - 1));
          else if (pIdx === 2) baseAlpha = 0.15 + 0.75 * (col / (CHARS_PER_COL - 1));
          else if (pIdx === 3) baseAlpha = (col + row) % 3 === 0 ? 0.90 : 0.0;
          else if (pIdx === 4) baseAlpha = (col + row) % 2 === 0 ? 0.85 : 0.05;
          else if (pIdx === 5) { // Sharp Radial
            const cx = (CHARS_PER_COL - 1) / 2;
            const cy = (CHARS_PER_ROW - 1) / 2;
            const maxD = Math.sqrt(cx * cx + cy * cy);
            const d = Math.sqrt(Math.pow(col - cx, 2) + Math.pow(row - cy, 2)) / maxD;
            baseAlpha = d < 0.45 ? 0.95 : 0.0;
          } else if (pIdx === 6) {
            baseAlpha = Math.random() < 0.30 ? 0.95 : 0.0;
          } else if (pIdx === 7) {
            const isBorder = col === 0 || row === 0 || col === CHARS_PER_COL - 1 || row === CHARS_PER_ROW - 1;
            baseAlpha = isBorder ? 0.95 : 0.0;
          } else if (pIdx === 8) baseAlpha = row % 3 === 0 ? 0.88 : 0.0;
          else if (pIdx === 9) baseAlpha = col % 3 === 0 ? 0.88 : 0.0;
          else if (pIdx === 10) baseAlpha = Math.abs(Math.sin(col / 1.5 + row / 2)) > 0.6 ? 0.85 : 0.0;
          else if (pIdx === 11) {
            const isCross = col === Math.floor(CHARS_PER_COL / 2) || row === Math.floor(CHARS_PER_ROW / 2);
            baseAlpha = isCross ? 0.95 : 0.0;
          } else if (pIdx === 12) baseAlpha = (col * row) % 4 === 0 ? 0.85 : 0.0;
          else if (pIdx === 13) baseAlpha = Math.abs(col - row) < 1.5 ? 0.92 : 0.0;
          else if (pIdx === 14) baseAlpha = (col + row) % 5 === 0 ? 0.88 : 0.0;
          else if (pIdx === 15) baseAlpha = Math.sin(row / 2) * Math.cos(col * 0.8) > 0.2 ? 0.85 : 0.0;
          else if (pIdx === 16) baseAlpha = col === row || col === (CHARS_PER_COL - 1 - row) ? 0.95 : 0.0;
          else if (pIdx === 17) baseAlpha = (row % 4 === 0 || col % 4 === 0) ? 0.85 : 0.0;
          else if (pIdx === 18) { // Strict Diamond
            const d = (Math.abs(col - (CHARS_PER_COL-1)/2) / (CHARS_PER_COL/2) + Math.abs(row - (CHARS_PER_ROW-1)/2) / (CHARS_PER_ROW/2));
            baseAlpha = d < 0.8 ? 0.95 : 0.0;
          } else if (pIdx === 19) { // Noise block
            baseAlpha = Math.random() > 0.6 ? 0.9 : 0.0;
          } else if (pIdx === 20) { // Top Left Triangle
            baseAlpha = (col + row < CHARS_PER_ROW) ? 0.9 : 0.0;
          } else if (pIdx === 21) { // Wavy spikes
            baseAlpha = row > (CHARS_PER_ROW/2 + Math.sin(col*0.8)*2.5) ? 0.92 : 0.0;
          } else if (pIdx === 22) { // Ring
            const cx = (CHARS_PER_COL - 1) / 2;
            const cy = (CHARS_PER_ROW - 1) / 2;
            const d = Math.sqrt(Math.pow(col - cx, 2) + Math.pow(row - cy, 2));
            baseAlpha = (d > 2.5 && d < 4.5) ? 0.95 : 0.0;
          } else if (pIdx === 23) { // Tree structure
            const cx = Math.floor(CHARS_PER_COL / 2);
            const isTrunk = col === cx && row >= 7;
            const isBranch1 = row < 7 && row >= 3 && col === cx - (7 - row);
            const isBranch2 = row < 7 && row >= 3 && col === cx + (7 - row);
            baseAlpha = (isTrunk || isBranch1 || isBranch2) ? 0.95 : 0.0;
          } else if (pIdx === 24) { // Checkerboard Large
            baseAlpha = (Math.floor(col/3) + Math.floor(row/3)) % 2 === 0 ? 0.85 : 0.0;
          } else if (pIdx === 25) { // Arrow Right
            baseAlpha = (col > row && (CHARS_PER_ROW - row) > col - (CHARS_PER_COL-CHARS_PER_ROW)) ? 0.9 : 0.0;
          } else if (pIdx === 26) { // Bottom Right Triangle
            baseAlpha = (col + row > CHARS_PER_ROW) ? 0.9 : 0.0;
          } else if (pIdx === 27) { // Horizontal Bar
            baseAlpha = (row > 3 && row < 7) ? 0.95 : 0.0;
          } else if (pIdx === 28) { // Vertical Bar
            baseAlpha = (col > 3 && col < 7) ? 0.95 : 0.0;
          } else if (pIdx === 29) { // Steps
            baseAlpha = (col > row) ? 0.85 : 0.0;
          } else if (pIdx === 30) { // Hexagon-ish
            const hDist = Math.abs(col - 5);
            const vDist = Math.abs(row - 5);
            baseAlpha = (hDist < 5 && vDist < 4 && (hDist*0.6 + vDist < 6)) ? 0.9 : 0.0;
          } else if (pIdx === 31) { // Hollow Frame
            const isFrame = (col >= 1 && col <= 9 && row >= 2 && row <= 8) && !(col >= 3 && col <= 7 && row >= 4 && row <= 6);
            baseAlpha = isFrame ? 0.92 : 0.0;
          }
          cells[row][col] = {
            baseAlpha,
            alpha: baseAlpha,
            colorIdx: colColors[col],
            flickTimer: Math.random() * 400,
            flickInterval: 150 + Math.random() * 1200
          };
        }
      }
      block.cells = cells;
    };

    const initGrid = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Dynamic density: Denser on wide screens
      const blockW = width > 1440 ? 85 : 110;
      const blockH = width > 1440 ? 140 : 180;
      
      if (stateRef.current) {
        stateRef.current.currentBlockW = blockW;
        stateRef.current.currentBlockH = blockH;
      }

      const gridCols = Math.ceil(width / blockW) + 2;
      const gridRows = Math.ceil(height / blockH) + 1;

      const blocks: Block[][] = [];
      for (let c = 0; c < gridCols; c++) {
        blocks[c] = [];
        for (let r = 0; r < gridRows; r++) {
          const b: Block = {
            baseX: (c - 1) * blockW + (r * (blockW * 0.38)) % blockW,
            baseY: r * blockH,
            patIdx: 0,
            connAlpha: 0,
            cells: [],
            palette: [],
            driftX: 0,
            driftY: 0,
            vx: 0,
            vy: 0
          };
          randomizeBlock(b);
          blocks[c][r] = b;
        }
      }
      return blocks;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (stateRef.current) {
        stateRef.current.blocks = initGrid();
        stateRef.current.scrollX = 0;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = stateRef.current;
      if (!state) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const t = performance.now();
      state.mouseX = x;
      state.mouseY = y;
      state.mouseActive = true;
      state.lastMove = t;

      if (state.trail.length === 0 || t - state.trail[state.trail.length - 1].time > 16) {
        state.trail.push({ x, y, time: t });
        if (state.trail.length > 24) state.trail.shift();
      }
    };

    const handleMouseLeave = () => {
      if (stateRef.current) {
        stateRef.current.mouseActive = false;
        // Keep the last position for the default presence
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    handleResize();

    stateRef.current = {
      blocks: initGrid(),
      trail: [],
      scrollX: 0,
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      mouseActive: true,
      globalFade: 1.0,
      lastTime: performance.now(),
      lastMove: performance.now(),
      currentBlockW: window.innerWidth > 1440 ? 85 : 110,
      currentBlockH: window.innerWidth > 1440 ? 140 : 180
    };

    const GLYPHS = ['}', '~', '/', '"', '\\', '#', '%', '*'];
    const createAtlas = () => {
      const atlasCanv = document.createElement('canvas');
      const aCtx = atlasCanv.getContext('2d')!;
      // 8 glyphs, 35 colors (7 palettes * 5)
      atlasCanv.width = 12 * GLYPHS.length;
      atlasCanv.height = 14 * (7 * 5);
      aCtx.font = 'bold 8px monospace';
      aCtx.textBaseline = 'top';
      aCtx.textAlign = 'left';
      const map = new Map<string, { x: number; y: number }>();
      PALETTES.forEach((palette, pIdx) => {
        palette.forEach((color, cIdx) => {
          GLYPHS.forEach((glyph, gIdx) => {
            const x = gIdx * 12;
            const y = (pIdx * 5 + cIdx) * 14;
            aCtx.fillStyle = color;
            aCtx.fillText(glyph, x, y);
            map.set(`${pIdx}-${cIdx}-${glyph}`, { x, y });
          });
        });
      });
      return { canvas: atlasCanv, map };
    };
    const atlas = createAtlas();

    let rafId: number;
    const render = (time: number) => {
      const state = stateRef.current;
      if (!state) return;

      const dt = Math.min(50, time - state.lastTime);
      state.lastTime = time;

      const blockW = state.currentBlockW;
      const blockH = state.currentBlockH;
      const totalGridW = state.blocks.length * blockW;

      // Update global scroll
      state.scrollX += 0.85 * (dt / 16.666);

      // Update globalFade
      if (time - state.lastMove > 5000) {
        state.globalFade = Math.max(0, state.globalFade - (dt / 1500)); 
      } else {
        state.globalFade = Math.min(1.0, state.globalFade + (dt / 500));
      }

      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mx = state.mouseX;
      const my = state.mouseY;
      const nodes: { x: number; y: number; alpha: number; dist: number; isHovered: boolean }[] = [];

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Step 1: Draw ASCII blocks
        state.blocks.forEach((col, colIdx) => {
          col.forEach((block, rowIdx) => {
            // Variety in speed and direction per row
            const rowSpeed = 0.4 + (rowIdx * 0.29) % 1.6;
            const dir = (rowIdx % 4 === 0) ? -1.0 : 1.0; 
            const rowOffset = (state.scrollX * rowSpeed * dir) % totalGridW;

            // Apply incremental drift
            block.driftX += block.vx * (dt / 16.666);
            block.driftY += block.vy * (dt / 16.666);

            const rawSx = block.baseX + block.driftX - rowOffset;
            const currentGen = Math.floor((rawSx + blockW) / totalGridW);
            
            if (block.generation === undefined) block.generation = currentGen;
            if (currentGen !== block.generation) {
              block.generation = currentGen;
              randomizeBlock(block);
            }

            let sx = rawSx - currentGen * totalGridW;
 
            // Vertical location drift
            const floatY = Math.sin(time * 0.0007 + rowIdx * 1.1) * 15;
            const sy = block.baseY + floatY + block.driftY;

            if (sx > canvas.width || sx + blockW < -blockW || sy > canvas.height || sy + blockH < 0) {
              return;
            }

            const node_x = sx + blockW / 2;
            const node_y = sy + blockH / 2;
            const dx = node_x - mx, dy = node_y - my;
            const distSq = dx * dx + dy * dy;
            const distFull = Math.sqrt(distSq);

            let target = Math.max(0.1, 1 - distFull / (canvas.width * 1.2)); 
            const isHovered = mx >= sx && mx <= sx + blockW && my >= sy && my <= sy + blockH;
            if (isHovered) target = Math.min(1.0, target + 0.2);

            block.connAlpha += (target - block.connAlpha) * (target > block.connAlpha ? 0.012 : 0.025);

            if (block.connAlpha > 0.01) {
              nodes.push({ x: node_x, y: node_y, alpha: block.connAlpha, dist: distFull, isHovered });
            }

            const charCycle = Math.floor(time / 185);
            const pIdx = block.patIdx % 7;

            for (let r = 0; r < CHARS_PER_ROW; r++) {
              for (let c = 0; c < CHARS_PER_COL; c++) {
                const cell = block.cells[r][c];
                cell.flickTimer += dt;
                if (cell.flickTimer > cell.flickInterval) {
                  cell.flickTimer = 0;
                  cell.flickInterval = 150 + Math.random() * 1200;
                  cell.alpha = Math.max(0.03, Math.min(0.98, cell.baseAlpha + (Math.random() - 0.5) * 0.10));
                }

                const rAlpha = Math.min(0.98, cell.alpha + block.connAlpha * 0.30);
                const finalAlpha = rAlpha; // Stay visible even if overlay fades
                if (finalAlpha < 0.05) continue;

                const glyphIdx = (charCycle + r + c + colIdx * 3 + rowIdx * 5) % GLYPHS.length;
                const glyph = GLYPHS[glyphIdx];
                const pos = atlas.map.get(`${pIdx}-${cell.colorIdx}-${glyph}`);
                
                if (pos) {
                  ctx.globalAlpha = finalAlpha;
                  ctx.drawImage(atlas.canvas, pos.x, pos.y, 10, 10, sx + PAD + c * CHAR_W, sy + PAD + r * CHAR_H, 10, 10);
                }
              }
            }
          });
        });
      
      ctx.globalAlpha = 1.0;
      ctx.font = '8px monospace';
      // Step 2: Overlay Effects
      // Always active for default presence
      if (true) {
        // Nearest connectors
        nodes.sort((a, b) => a.dist - b.dist).slice(0, 14).forEach(node => {
          const grey = Math.floor(65 + node.alpha * 135);
          const lAlpha = node.alpha * state.globalFade * (node.isHovered ? 1.0 : 0.20);
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = `rgba(${grey}, ${grey}, ${grey}, ${lAlpha})`;
          ctx.lineWidth = Math.max(0.3, 0.3 + node.alpha * (node.isHovered ? 0.8 : 0.3));
          ctx.setLineDash([]);
          ctx.stroke();
 
          // Proximity-based pulsing logic for color/alpha but not size
          const prox = Math.max(0, 1 - node.dist / 700);
          const nR = 1.4 + node.alpha * (node.isHovered ? 2.2 : 1.2);

          // Focus Rectangle (Stable, vertical)
          const rectW = 12 + node.alpha * 8;
          const rectH = 18 + node.alpha * 12;
          const hW = rectW / 2;
          const hH = rectH / 2;
          
          ctx.strokeStyle = `rgba(${grey + 70}, ${grey + 70}, ${grey + 70}, ${node.alpha * state.globalFade * (node.isHovered ? 0.75 : 0.35 + prox * 0.15)})`;
          ctx.lineWidth = node.isHovered ? 1.3 : 0.7 + prox * 0.3;
          ctx.strokeRect(node.x - hW, node.y - hH, rectW, rectH);

          // Node dot
          ctx.beginPath(); ctx.arc(node.x, node.y, nR, 0, Math.PI * 2);
          const glow = node.isHovered ? 80 + Math.sin(time * 0.015) * 35 : 20 + prox * 40;
          ctx.fillStyle = `rgba(${grey + glow}, ${grey + glow}, ${grey + glow}, ${node.alpha * state.globalFade * (node.isHovered ? 0.95 : 0.6 + prox * 0.2)})`;
          ctx.fill();

          // Distance label on top of rect
          ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.font = '8px monospace';
          ctx.fillStyle = `rgba(180, 160, 140, ${node.alpha * state.globalFade * 0.9})`;
          ctx.fillText(`${Math.round(node.dist)}px`, node.x, node.y - hH - 4);
        });

      }

      // Cursor
      if (state.mouseActive) {
        ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(158, 152, 145, ${state.globalFade * 0.92})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-auto z-0"
      style={{ opacity: 1, cursor: 'none' }}
    />
  );
}
