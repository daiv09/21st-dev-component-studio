'use client';

import React, { useEffect, useRef } from 'react';

export default function ReactionDiffusionFlow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
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
      ctx.fillStyle = 'rgba(8, 4, 12, 0.04)';
      ctx.fillRect(0, 0, width, height);

      const gridSize = 12;
      for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
          const cx = x + gridSize / 2;
          const cy = y + gridSize / 2;
          const nx = x / width;
          const ny = y / height;
          const dx = nx - mouse.x;
          const dy = ny - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.exp(-dist * 3);

          const wave1 = Math.sin(nx * 8 + dist * 6) * Math.cos(ny * 6 - dist * 4);
          const wave2 = Math.cos(nx * 12 - dist * 8) * Math.sin(ny * 10 + dist * 5);
          const value = (wave1 + wave2) * 0.25 + influence * 0.4;

          const hue = 280 + value * 60;
          const alpha = Math.max(0, Math.min(1, Math.abs(value) + influence * 0.3));
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
          ctx.fillRect(x, y, gridSize - 1, gridSize - 1);
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
    <div className="relative w-full h-full overflow-hidden bg-[#08040c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
