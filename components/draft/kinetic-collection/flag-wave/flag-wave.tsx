'use client';

import React, { useEffect, useRef } from 'react';

export default function FlagWave() {
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
      time += 0.012;
      ctx.fillStyle = '#0a0612';
      ctx.fillRect(0, 0, width, height);

      const flagWidth = width * 0.7;
      const flagHeight = height * 0.5;
      const startX = (width - flagWidth) / 2;
      const startY = (height - flagHeight) / 2;

      const cols = 40;
      const rows = 25;
      const cellW = flagWidth / cols;
      const cellH = flagHeight / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = c / cols;
          const x = startX + c * cellW;
          const baseY = startY + r * cellH;
          const wave = (
            Math.sin(t * 6 + time * 2) * 25 +
            Math.cos(t * 10 - time) * 15 +
            Math.sin(t * 4 + time * 0.5) * 10
          ) * t;
          const windEffect = (mouse.x - 0.5) * 100 * t;
          const y = baseY + wave + windEffect;

          // Color gradient
          const hue = (c / cols) * 60 + (r / rows) * 30 + 200;
          const lightness = 30 + (r / rows) * 40;
          ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;

          // Draw as quad
          const t2 = (c + 1) / cols;
          const x2 = startX + (c + 1) * cellW;
          const wave2 = (
            Math.sin(t2 * 6 + time * 2) * 25 +
            Math.cos(t2 * 10 - time) * 15 +
            Math.sin(t2 * 4 + time * 0.5) * 10
          ) * t2;
          const y2 = baseY + wave2 + windEffect;
          const t3 = (c + 1) / cols;
          const wave3 = (
            Math.sin(t3 * 6 + time * 2) * 25 +
            Math.cos(t3 * 10 - time) * 15
          ) * t3;
          const y3 = baseY + cellH + wave3 + windEffect;
          const wave4 = (
            Math.sin(t * 6 + time * 2) * 25 +
            Math.cos(t * 10 - time) * 15
          ) * t;
          const y4 = baseY + cellH + wave4 + windEffect;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x2, y3);
          ctx.lineTo(x, y4);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Pole
      ctx.fillStyle = '#4a3520';
      ctx.fillRect(startX - 10, startY - 20, 10, flagHeight + 40);
      ctx.fillStyle = '#d4a574';
      ctx.beginPath();
      ctx.arc(startX - 5, startY - 20, 8, 0, Math.PI * 2);
      ctx.fill();

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
