'use client';

import React, { useEffect, useRef } from 'react';

export default function SpiralGalaxyDistort() {
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
      time += 0.012;
      ctx.fillStyle = 'rgba(2, 0, 12, 0.04)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const arms = 3;
      const points = 600;

      for (let arm = 0; arm < arms; arm++) {
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const t = i / points;
          const baseAngle = t * Math.PI * 6 + (arm / arms) * Math.PI * 2;
          const r = t * Math.min(width, height) * 0.45;
          const angle = baseAngle + time * 0.5;
          const dist2Mouse = Math.sqrt(
            Math.pow((cx + Math.cos(angle) * r) / width - mouse.x, 2) +
            Math.pow((cy + Math.sin(angle) * r) / height - mouse.y, 2)
          );
          const distortion = Math.exp(-dist2Mouse * 8) * 100 * Math.sin(time * 3 + t * 10);
          const r2 = r + distortion;

          const x = cx + Math.cos(angle) * r2;
          const y = cy + Math.sin(angle) * r2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${180 + arm * 60}, 80%, 60%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Stars on arms
      for (let i = 0; i < 200; i++) {
        const arm = i % arms;
        const t = ((i * 13) % 100) / 100;
        const angle = t * Math.PI * 6 + (arm / arms) * Math.PI * 2 + time * 0.5;
        const r = t * Math.min(width, height) * 0.45;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const size = 0.5 + Math.random() * 1.5;

        ctx.fillStyle = `hsl(${180 + arm * 60 + Math.random() * 30}, 80%, 80%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#02000c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
