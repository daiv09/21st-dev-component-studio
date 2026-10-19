'use client';

import React, { useEffect, useRef } from 'react';

export default function SpirographRainbow() {
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
      time += 0.01;
      ctx.fillStyle = 'rgba(8, 4, 16, 0.03)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.35;

      const configurations = [
        { r: R * 0.3, d: R * 0.4, hueShift: 0 },
        { r: R * 0.4, d: R * 0.3, hueShift: 60 },
        { r: R * 0.5, d: R * 0.25, hueShift: 120 },
        { r: R * 0.35, d: R * 0.45, hueShift: 180 },
      ];

      for (const config of configurations) {
        const r = config.r;
        const d = config.d;
        const lcm = 50;

        ctx.beginPath();
        for (let t = 0; t < lcm * 100; t += 0.5) {
          const angle = (t / lcm) * 2 * Math.PI;
          const x = cx + (R - r) * Math.cos(angle) + d * Math.cos((R - r) / r * angle);
          const y = cy + (R - r) * Math.sin(angle) - d * Math.sin((R - r) / r * angle);

          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const hue = (config.hueShift + time * 20) % 360;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
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
    <div className="relative w-full h-full overflow-hidden bg-[#080410]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
