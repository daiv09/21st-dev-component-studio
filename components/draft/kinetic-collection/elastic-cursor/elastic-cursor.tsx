'use client';

import React, { useEffect, useRef } from 'react';

export default function ElasticCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
    const points: { x: number; y: number; vx: number; vy: number; size: number; hue: number }[] = [];

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
      const newX = (e.clientX - rect.left) / width;
      const newY = (e.clientY - rect.top) / height;
      mouse.vx = (newX - mouse.x) * 10;
      mouse.vy = (newY - mouse.y) * 10;
      mouse.x = newX;
      mouse.y = newY;

      // Spawn new points
      for (let i = 0; i < 2; i++) {
        points.push({
          x: mouse.x * width,
          y: mouse.y * height,
          vx: mouse.vx + (Math.random() - 0.5) * 2,
          vy: mouse.vy + (Math.random() - 0.5) * 2,
          size: 3 + Math.random() * 4,
          hue: 280 + Math.random() * 60,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      ctx.fillStyle = 'rgba(8, 4, 12, 0.08)';
      ctx.fillRect(0, 0, width, height);

      // Update points
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.size *= 0.97;

        if (p.size < 0.3) {
          points.splice(i, 1);
          continue;
        }

        // Draw point
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 70%, 0.8)`);
        grad.addColorStop(1, `hsla(${p.hue}, 80%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main cursor
      const cx = mouse.x * width;
      const cy = mouse.y * height;
      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      const stretch = Math.min(2, 1 + speed * 0.1);

      ctx.save();
      ctx.translate(cx, cy);
      const angle = Math.atan2(mouse.vy, mouse.vx);
      ctx.rotate(angle);
      ctx.scale(stretch, 1 / stretch);

      const cursorGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      cursorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      cursorGrad.addColorStop(0.5, 'rgba(180, 100, 255, 0.6)');
      cursorGrad.addColorStop(1, 'rgba(100, 50, 200, 0)');
      ctx.fillStyle = cursorGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Velocity decay
      mouse.vx *= 0.9;
      mouse.vy *= 0.9;

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
      <canvas ref={canvasRef} className="absolute inset-0 cursor-none" />
    </div>
  );
}
