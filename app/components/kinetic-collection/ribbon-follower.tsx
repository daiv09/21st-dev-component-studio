'use client';

import React, { useEffect, useRef } from 'react';

export default function RibbonFollower() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouseHistory: { x: number; y: number; t: number }[] = [];
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

    let time = 0;
    const render = () => {
      time += 0.015;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      mouseHistory.push({ x: mouse.x * width, y: mouse.y * height, t: time });
      if (mouseHistory.length > 30) mouseHistory.shift();

      ctx.fillStyle = 'rgba(15, 8, 24, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Draw multiple ribbons with delay
      const ribbonCount = 12;
      for (let r = 0; r < ribbonCount; r++) {
        const offset = r * 3;
        const historySlice = mouseHistory.slice(0, mouseHistory.length - offset);
        if (historySlice.length < 2) continue;

        const hue = (r / ribbonCount) * 60 + 280;
        ctx.beginPath();
        for (let i = 0; i < historySlice.length; i++) {
          const p = historySlice[i];
          const wave = Math.sin(i * 0.3 - time * 2 + r) * 20;
          const x = p.x + Math.cos(i * 0.2 + r) * wave;
          const y = p.y + Math.sin(i * 0.2 + r) * wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.7 - r * 0.04})`;
        ctx.lineWidth = 3 - r * 0.15;
        ctx.stroke();

        // Glow
        ctx.beginPath();
        for (let i = 0; i < historySlice.length; i++) {
          const p = historySlice[i];
          const wave = Math.sin(i * 0.3 - time * 2 + r) * 20;
          const x = p.x + Math.cos(i * 0.2 + r) * wave;
          const y = p.y + Math.sin(i * 0.2 + r) * wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.3 - r * 0.02})`;
        ctx.lineWidth = 8 - r * 0.4;
        ctx.stroke();
      }

      // Cursor point
      const cx = mouse.x * width;
      const cy = mouse.y * height;
      const cursorGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      cursorGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      cursorGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#0f0818]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
