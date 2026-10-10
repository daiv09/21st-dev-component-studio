'use client';

import React, { useEffect, useRef } from 'react';

export default function FlowFieldPaint() {
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
      time += 0.005;
      ctx.fillStyle = 'rgba(8, 5, 12, 0.02)';
      ctx.fillRect(0, 0, width, height);

      const step = 6;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const nx = x / width;
          const ny = y / height;
          const dx = nx - mouse.x;
          const dy = ny - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = (
            Math.sin(nx * 4 + time) +
            Math.cos(ny * 3 - time) +
            Math.sin((nx + ny) * 3 + time * 2) +
            Math.exp(-dist * 5) * Math.sin(time * 3)
          ) * Math.PI;

          const length = 12 + Math.sin(dist * 8 - time * 3) * 8;
          const x2 = x + Math.cos(angle) * length;
          const y2 = y + Math.sin(angle) * length;

          const hue = (angle * 30 + time * 20 + dist * 60) % 360;
          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.5)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
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
    <div className="relative w-full h-full overflow-hidden bg-[#08050c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
