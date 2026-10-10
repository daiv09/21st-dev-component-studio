'use client';

import React, { useEffect, useRef } from 'react';

export default function JellyBlob() {
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
    const mouse = { x: 0.5, y: 0.5, down: false };

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
    canvas.addEventListener('mousedown', () => { mouse.down = true; });
    canvas.addEventListener('mouseup', () => { mouse.down = false; });
    handleResize();

    const render = () => {
      time += 0.015;
      ctx.fillStyle = 'rgba(8, 4, 16, 0.05)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 100;
      const cy = height / 2 + (mouse.y - 0.5) * 100;
      const baseRadius = Math.min(width, height) * 0.25;

      const points = 150;
      const jellyPoints: { x: number; y: number }[] = [];

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave1 = Math.sin(angle * 4 + time * 2) * 0.15;
        const wave2 = Math.cos(angle * 6 - time * 1.5) * 0.1;
        const wave3 = Math.sin(angle * 8 + time * 3) * 0.05;
        const r = baseRadius * (1 + wave1 + wave2 + wave3);
        jellyPoints.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
        });
      }

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        if (i === 0) ctx.moveTo(jellyPoints[i].x, jellyPoints[i].y);
        else ctx.lineTo(jellyPoints[i].x, jellyPoints[i].y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
      grad.addColorStop(0, 'rgba(255, 150, 220, 0.9)');
      grad.addColorStop(0.5, 'rgba(180, 100, 255, 0.8)');
      grad.addColorStop(1, 'rgba(100, 50, 200, 0.6)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.arc(cx - baseRadius * 0.3, cy - baseRadius * 0.3, baseRadius * 0.2, 0, Math.PI * 2);
      const highlightGrad = ctx.createRadialGradient(
        cx - baseRadius * 0.3, cy - baseRadius * 0.3, 0,
        cx - baseRadius * 0.3, cy - baseRadius * 0.3, baseRadius * 0.2
      );
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGrad;
      ctx.fill();

      // Outline
      ctx.strokeStyle = 'rgba(255, 200, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        if (i === 0) ctx.moveTo(jellyPoints[i].x, jellyPoints[i].y);
        else ctx.lineTo(jellyPoints[i].x, jellyPoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();

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
    <div className="relative w-full h-full overflow-hidden bg-[#080410]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
