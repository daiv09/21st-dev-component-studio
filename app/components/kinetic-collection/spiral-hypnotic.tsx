'use client';

import React, { useEffect, useRef } from 'react';

export default function SpiralHypnotic() {
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
      time += 0.015;
      ctx.fillStyle = 'rgba(2, 0, 8, 0.05)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 150;
      const cy = height / 2 + (mouse.y - 0.5) * 150;
      const maxRadius = Math.min(width, height) * 0.45;
      const arms = 5;
      const twists = 4;

      for (let i = 0; i < 100; i++) {
        const t = i / 100;
        const angle = t * Math.PI * 2 * twists + time;
        const r = t * maxRadius;
        for (let a = 0; a < arms; a++) {
          const armAngle = angle + (a / arms) * Math.PI * 2;
          const x = cx + Math.cos(armAngle) * r;
          const y = cy + Math.sin(armAngle) * r;

          const size = 3 - t * 2;
          const hue = 200 + t * 80 + a * 30;
          const alpha = (1 - t) * 0.8;

          ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Center
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
      centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      centerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#020008]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
