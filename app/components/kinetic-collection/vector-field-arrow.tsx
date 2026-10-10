'use client';

import React, { useEffect, useRef } from 'react';

export default function VectorFieldArrow() {
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
      time += 0.008;
      ctx.fillStyle = 'rgba(8, 5, 16, 0.04)';
      ctx.fillRect(0, 0, width, height);

      const step = 30;

      for (let y = step; y < height; y += step) {
        for (let x = step; x < width; x += step) {
          const nx = x / width;
          const ny = y / height;
          const dx = nx - mouse.x;
          const dy = ny - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const angle = (
            Math.sin(nx * 3 + time) +
            Math.cos(ny * 2 - time * 0.7) +
            Math.exp(-dist * 4) * Math.sin(time * 2)
          ) * Math.PI;

          const length = 15 + Math.sin(dist * 5 - time) * 5;
          const x2 = x + Math.cos(angle) * length;
          const y2 = y + Math.sin(angle) * length;

          const hue = (angle * 30 + time * 30) % 360;
          const alpha = 0.4 + Math.exp(-dist * 3) * 0.4;

          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Arrowhead
          const headLen = 4;
          const headAngle = 0.5;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - Math.cos(angle - headAngle) * headLen, y2 - Math.sin(angle - headAngle) * headLen);
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - Math.cos(angle + headAngle) * headLen, y2 - Math.sin(angle + headAngle) * headLen);
          ctx.stroke();

          // Dot
          ctx.fillStyle = `hsla(${hue}, 80%, 75%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#080510]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
