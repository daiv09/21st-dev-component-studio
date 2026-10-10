'use client';

import React, { useEffect, useRef } from 'react';

export default function AudioSpectrum3D() {
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

    const render = () => {
      time += 0.025;
      ctx.fillStyle = 'rgba(2, 0, 8, 0.12)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const bars = 60;
      const radius = 120;
      const step = 6;

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const h = Math.abs(
          Math.sin(time + i * 0.3) * 60 +
          Math.cos(time * 1.3 + i * 0.2) * 40 +
          Math.sin(time * 0.7 + i) * 30
        );

        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + h);
        const y2 = cy + Math.sin(angle) * (radius + h);

        for (let j = 0; j < h; j += step) {
          const t = j / Math.max(h, 1);
          const x = cx + Math.cos(angle) * (radius + j);
          const y = cy + Math.sin(angle) * (radius + j);
          const size = 4 - t * 2;
          const hue = (i / bars) * 360 + t * 60;
          const alpha = 1 - t * 0.7;
          ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
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
    <div className="relative w-full h-full overflow-hidden bg-[#020008]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
