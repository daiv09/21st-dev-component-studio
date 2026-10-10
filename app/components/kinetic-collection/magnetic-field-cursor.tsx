'use client';

import React, { useEffect, useRef } from 'react';

export default function MagneticFieldCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

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
      mouse.targetX = (e.clientX - rect.left) / width;
      mouse.targetY = (e.clientY - rect.top) / height;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.fillStyle = 'rgba(8, 2, 16, 0.04)';
      ctx.fillRect(0, 0, width, height);

      const cx = mouse.x * width;
      const cy = mouse.y * height;
      const lines = 30;
      const maxLength = 250;

      for (let i = 0; i < lines; i++) {
        const angle = (i / lines) * Math.PI * 2;
        let x = cx;
        let y = cy;
        const points: { x: number; y: number }[] = [{ x, y }];

        for (let step = 0; step < 50; step++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

          // Tangential force (rotates around cursor)
          const tx = -dy / dist;
          const ty = dx / dist;

          // Radial force (outward)
          const rx = dx / dist;
          const ry = dy / dist;

          const t = step / 50;
          const strength = 5 + Math.sin(t * Math.PI) * 5;
          x += tx * strength;
          y += ty * strength;

          if (dist > maxLength) break;
          points.push({ x, y });
        }

        ctx.beginPath();
        for (let p = 0; p < points.length; p++) {
          if (p === 0) ctx.moveTo(points[p].x, points[p].y);
          else ctx.lineTo(points[p].x, points[p].y);
        }
        const hue = 200 + i * 6;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cursor glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#080210]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
