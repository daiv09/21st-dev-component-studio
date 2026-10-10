'use client';

import React, { useEffect, useRef } from 'react';

export default function PaperFoldingGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;
    const mouse = { x: 0.5, y: 0.5 };

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / width;
      mouse.y = (e.clientY - rect.top) / height;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      time += 0.008;
      ctx.fillStyle = '#f5f0e8';
      ctx.fillRect(0, 0, width, height);

      const cellSize = 40;
      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize;
          const y = r * cellSize;
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const dx = (c / cols) - mouse.x;
          const dy = (r / rows) - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const fold = Math.sin(dist * 8 - time * 2) * 0.5 + 0.5;
          const shade = 0.5 + Math.cos(c * 0.5 + r * 0.5 + time) * 0.3;
          const alpha = 0.4 + fold * 0.4;

          ctx.fillStyle = `hsla(${20 + dist * 40}, 30%, ${shade * 60}%, ${alpha})`;
          ctx.fillRect(x, y, cellSize, cellSize);

          // Fold lines
          ctx.strokeStyle = `rgba(100, 60, 30, ${0.3 * fold})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
