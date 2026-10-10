'use client';

import React, { useEffect, useRef } from 'react';

export default function LiquidMercury() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, down: false };
    let time = 0;

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

    const handleMouseDown = () => { mouse.down = true; };
    const handleMouseUp = () => { mouse.down = false; };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    handleResize();

    const render = () => {
      time += 0.012;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const baseColor = mouse.down ? '#1a0a1f' : '#0a0a1a';
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, width, height);

      const cx = mouse.x * width;
      const cy = mouse.y * height;
      const baseRadius = 200;

      // Liquid metal blob using noise
      const points = 120;
      const blobs: { cx: number; cy: number; r: number }[] = [];
      for (let i = 0; i < 3; i++) {
        const angle = (time * 0.5 + i * 2.1) * Math.PI;
        const dist = 60 + Math.sin(time + i) * 30;
        blobs.push({
          cx: cx + Math.cos(angle) * dist,
          cy: cy + Math.sin(angle) * dist,
          r: baseRadius * 0.6,
        });
      }

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let r = 0;
        for (const blob of blobs) {
          const dx = blob.cx - cx;
          const dy = blob.cy - cy;
          const bx = cx + Math.cos(angle) * baseRadius + dx;
          const by = cy + Math.sin(angle) * baseRadius + dy;
          const dist = Math.sqrt((bx - blob.cx) ** 2 + (by - blob.cy) ** 2);
          r += (blob.r / Math.max(dist * 0.5, 50)) * 30;
        }
        r += baseRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.5);
      grad.addColorStop(0, mouse.down ? 'rgba(255, 100, 200, 0.9)' : 'rgba(220, 220, 240, 0.95)');
      grad.addColorStop(0.4, mouse.down ? 'rgba(200, 80, 220, 0.8)' : 'rgba(150, 160, 200, 0.8)');
      grad.addColorStop(0.8, mouse.down ? 'rgba(120, 60, 180, 0.6)' : 'rgba(80, 100, 160, 0.6)');
      grad.addColorStop(1, 'rgba(40, 60, 100, 0.3)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Highlights
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = baseRadius * 0.9;
        const x = cx - baseRadius * 0.3 + Math.cos(angle) * r * 0.5;
        const y = cy - baseRadius * 0.4 + Math.sin(angle) * r * 0.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const highlight = ctx.createRadialGradient(cx - 60, cy - 80, 0, cx - 60, cy - 80, 100);
      highlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlight;
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-pointer" />
    </div>
  );
}
