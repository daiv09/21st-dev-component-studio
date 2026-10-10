'use client';

import React, { useEffect, useRef } from 'react';

export default function LissajousOrbiter() {
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
      time += 0.005;
      ctx.fillStyle = 'rgba(5, 3, 12, 0.05)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const a = Math.min(width, height) * 0.35;
      const b = Math.min(width, height) * 0.25;
      const mouseInfluence = (mouse.x - 0.5) * 3;

      const points = 500;
      for (let p = 0; p < 3; p++) {
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const t = (i / points) * Math.PI * 2;
          const freqX = 3 + mouseInfluence + p;
          const freqY = 2 + p * 0.5;
          const x = cx + a * Math.sin(freqX * t + time);
          const y = cy + b * Math.sin(freqY * t);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const hue = 200 + p * 50 + time * 10;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Orbiting dot
      const t = time;
      const x = cx + a * Math.sin((3 + mouseInfluence) * t + time);
      const y = cy + b * Math.sin(2 * t);
      const dotGlow = ctx.createRadialGradient(x, y, 0, x, y, 20);
      dotGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      dotGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = dotGlow;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#05030c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
