'use client';

import React, { useEffect, useRef } from 'react';

export default function WireframeTunnel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let z = 0;
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
      z += 1.5;
      ctx.fillStyle = 'rgba(2, 0, 12, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 200;
      const cy = height / 2 + (mouse.y - 0.5) * 200;
      const segments = 20;
      const segmentSize = 30;
      const fov = 300;

      // Draw wireframe squares receding
      for (let i = 0; i < 30; i++) {
        const depth = (i * segmentSize + z) % 600;
        if (depth < 1) continue;
        const scale = fov / depth;
        const size = 200 * scale;

        const alpha = 1 - depth / 600;
        const hue = 200 + i * 8;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.7})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let a = 0; a < 4; a++) {
          const angle = (a / 4) * Math.PI * 2 + i * 0.05;
          const x = cx + Math.cos(angle) * size;
          const y = cy + Math.sin(angle) * size;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Vanishing point glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#02000c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
