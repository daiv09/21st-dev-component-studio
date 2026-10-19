'use client';

import React, { useEffect, useRef } from 'react';

export default function CellularAutomataLife() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const cols = 100;
    const rows = 60;
    let cells: Uint8Array;
    let next: Uint8Array;
    let gen = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const cellW = Math.floor(width / cols);
    const cellH = Math.floor(height / rows);
    cells = new Uint8Array(cols * rows);
    next = new Uint8Array(cols * rows);

    // Seed
    for (let i = 0; i < cells.length; i++) {
      cells[i] = Math.random() > 0.7 ? 1 : 0;
    }

    const countNeighbors = (c: number, r: number) => {
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nc = (c + dx + cols) % cols;
          const nr = (r + dy + rows) % rows;
          count += cells[nc + nr * cols];
        }
      }
      return count;
    };

    const step = () => {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n = countNeighbors(c, r);
          const i = c + r * cols;
          if (cells[i]) {
            next[i] = n === 2 || n === 3 ? 1 : 0;
          } else {
            next[i] = n === 3 ? 1 : 0;
          }
        }
      }
      [cells, next] = [next, cells];
    };

    const render = () => {
      if (gen % 8 === 0) step();
      gen++;

      ctx.fillStyle = 'rgba(2, 0, 10, 0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (cells[c + r * cols]) {
            const age = Math.random();
            const hue = 160 + age * 40;
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.9)`;
            ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#02000a]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
