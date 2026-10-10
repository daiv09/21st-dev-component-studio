'use client';

import React, { useEffect, useRef } from 'react';

export default function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const particles: { angle: number; distance: number; speed: number; size: number; hue: number }[] = [];
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

      particles.length = 0;
      for (let i = 0; i < 400; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          distance: 100 + Math.random() * Math.min(width, height) * 0.4,
          speed: 0.005 + Math.random() * 0.02,
          size: 0.5 + Math.random() * 1.5,
          hue: 30 + Math.random() * 30,
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 80;
      const cy = height / 2 + (mouse.y - 0.5) * 80;

      // Update particles
      for (const p of particles) {
        p.angle += p.speed;
        p.distance *= 0.998;
        if (p.distance < 30) {
          p.distance = 100 + Math.random() * Math.min(width, height) * 0.4;
        }
      }

      // Draw particles
      for (const p of particles) {
        const x = cx + Math.cos(p.angle) * p.distance;
        const y = cy + Math.sin(p.angle) * p.distance;
        const temp = 5000 - p.distance * 5;
        const hue = p.hue + (100 - p.distance / 4);

        ctx.fillStyle = `hsl(${hue}, 80%, ${60 + Math.min(40, 100 - p.distance / 5)}%)`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        const trailX = cx + Math.cos(p.angle - 0.05) * p.distance;
        const trailY = cy + Math.sin(p.angle - 0.05) * p.distance;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(trailX, trailY);
        ctx.stroke();
      }

      // Event horizon
      const horizonGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      horizonGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      horizonGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
      horizonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = horizonGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disk glow
      const diskGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 80);
      diskGlow.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
      diskGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');
      ctx.fillStyle = diskGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
