'use client';

import React, { useEffect, useRef } from 'react';

export default function VectorPortrait() {
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
      time += 0.01;
      ctx.fillStyle = 'rgba(8, 5, 12, 0.04)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 200;
      const cy = height / 2 + (mouse.y - 0.5) * 200;

      // Multiple flowing curves
      for (let layer = 0; layer < 4; layer++) {
        ctx.beginPath();
        const points = 200;
        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const angle = t * Math.PI * 2 + time * (0.3 + layer * 0.1);
          const radius = (100 + layer * 30) * (1 + Math.sin(t * 5 + time + layer) * 0.3);
          const x = cx + Math.cos(angle + layer) * radius;
          const y = cy + Math.sin(angle + layer) * radius;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const hue = 280 + layer * 30 + time * 20;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Center particles
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2 + time;
        const r = 30 + Math.sin(time * 2 + i) * 10;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.fillStyle = `hsl(280, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#08050c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
