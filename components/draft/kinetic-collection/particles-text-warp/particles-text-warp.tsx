'use client';

import React, { useEffect, useRef } from 'react';

export default function ParticlesTextWarp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const particles: { x: number; y: number; originX: number; originY: number; vx: number; vy: number; hue: number }[] = [];
    const text = 'INFINITE';
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

      // Recompute text mask
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d')!;
      offCtx.fillStyle = 'white';
      offCtx.font = `bold ${Math.min(width, height) * 0.18}px sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(text, width / 2, height / 2);

      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;

      particles.length = 0;
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          if (data[(y * width + x) * 4] > 128) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              hue: 200 + Math.random() * 60,
            });
          }
        }
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
      ctx.fillStyle = 'rgba(2, 0, 8, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const mx = mouse.x * width;
      const my = mouse.y * height;

      for (const p of particles) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.vx -= (dx / dist) * 2;
          p.vy -= (dy / dist) * 2;
        }

        p.vx += (p.originX - p.x) * 0.005;
        p.vy += (p.originY - p.y) * 0.005;

        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue + time * 30}, 80%, 60%)`;
        ctx.fill();
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
    <div className="relative w-full h-full overflow-hidden bg-[#020008]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
