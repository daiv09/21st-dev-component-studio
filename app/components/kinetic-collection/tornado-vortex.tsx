'use client';

import React, { useEffect, useRef } from 'react';

export default function TornadoVortex() {
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
    const particles: { y: number; angle: number; distance: number; speed: number; size: number; hue: number }[] = [];

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

    for (let i = 0; i < 200; i++) {
      particles.push({
        y: Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        distance: 50 + Math.random() * 100,
        speed: 0.05 + Math.random() * 0.05,
        size: 0.5 + Math.random() * 1.5,
        hue: 200 + Math.random() * 60,
      });
    }

    const render = () => {
      time += 0.015;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 100;
      const cy = height / 2 + (mouse.y - 0.5) * 100;

      for (const p of particles) {
        p.angle += p.speed;
        p.y -= 3;

        // Taper funnel
        const yProgress = p.y / height;
        const maxDist = 200 * (1 - yProgress * 0.8);
        const x = cx + Math.cos(p.angle) * Math.min(p.distance, maxDist);
        const y = p.y;
        const size = p.size * (1 - yProgress * 0.5);

        // Vertical streak
        ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, 0.6)`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(p.angle) * 10, y - 10);
        ctx.stroke();

        ctx.fillStyle = `hsl(${p.hue}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        if (p.y < 0) {
          p.y = height;
          p.angle = Math.random() * Math.PI * 2;
        }
      }

      // Debris at top
      const debrisY = height * 0.3;
      const debrisGrad = ctx.createRadialGradient(cx, debrisY, 0, cx, debrisY, 300);
      debrisGrad.addColorStop(0, 'rgba(150, 100, 200, 0.3)');
      debrisGrad.addColorStop(1, 'rgba(150, 100, 200, 0)');
      ctx.fillStyle = debrisGrad;
      ctx.beginPath();
      ctx.arc(cx, debrisY, 300, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#0a0612]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
