'use client';

import React, { useEffect, useRef } from 'react';

export default function PhosphorTrace() {
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
    const points: { x: number; y: number; angle: number; distance: number; speed: number; hue: number }[] = [];

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

    for (let i = 0; i < 8; i++) {
      points.push({
        x: 0, y: 0, angle: (i / 8) * Math.PI * 2,
        distance: 100 + i * 30, speed: 0.02 + Math.random() * 0.02,
        hue: 120 + i * 20,
      });
    }

    const render = () => {
      time += 0.01;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, width, height);

      const cx = mouse.x * width;
      const cy = mouse.y * height;

      ctx.lineCap = 'round';
      for (const p of points) {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.distance;
        const y = cy + Math.sin(p.angle) * p.distance;

        ctx.strokeStyle = `hsla(${p.hue}, 100%, 60%, 0.8)`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        for (let i = 1; i <= 5; i++) {
          const t = i / 5;
          const trailAngle = p.angle - p.speed * i * 2;
          const trailX = cx + Math.cos(trailAngle) * p.distance;
          const trailY = cy + Math.sin(trailAngle) * p.distance;
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${(1 - t) * 0.5})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, 3 - t, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
