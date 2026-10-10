'use client';

import React, { useEffect, useRef } from 'react';

export default function GalaxyCluster() {
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
    const galaxies: { x: number; y: number; size: number; rotation: number; speed: number; hue: number; stars: { angle: number; distance: number; size: number }[] }[] = [];

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      galaxies.length = 0;
      for (let i = 0; i < 5; i++) {
        const gx = 0.2 + Math.random() * 0.6;
        const gy = 0.2 + Math.random() * 0.6;
        const stars: { angle: number; distance: number; size: number }[] = [];
        for (let j = 0; j < 100; j++) {
          stars.push({
            angle: Math.random() * Math.PI * 2,
            distance: Math.random() * 50,
            size: 0.3 + Math.random() * 0.8,
          });
        }
        galaxies.push({
          x: gx,
          y: gy,
          size: 40 + Math.random() * 30,
          rotation: Math.random() * Math.PI * 2,
          speed: 0.005 + Math.random() * 0.01,
          hue: 200 + i * 30,
          stars,
        });
      }
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
      ctx.fillStyle = 'rgba(0, 0, 8, 0.06)';
      ctx.fillRect(0, 0, width, height);

      for (const g of galaxies) {
        g.rotation += g.speed;
        const cx = g.x * width + (mouse.x - 0.5) * 50;
        const cy = g.y * height + (mouse.y - 0.5) * 50;

        // Core
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, g.size * 0.3);
        coreGlow.addColorStop(0, `hsla(${g.hue}, 80%, 80%, 0.9)`);
        coreGlow.addColorStop(1, `hsla(${g.hue}, 80%, 50%, 0)`);
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, g.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stars
        for (const s of g.stars) {
          const angle = s.angle + g.rotation;
          const x = cx + Math.cos(angle) * s.distance;
          const y = cy + Math.sin(angle) * s.distance;
          const alpha = Math.max(0, 1 - s.distance / 50);
          ctx.fillStyle = `hsla(${g.hue + 20}, 80%, 80%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, Math.PI * 2);
          ctx.fill();
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
    <div className="relative w-full h-full overflow-hidden bg-[#000008]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
