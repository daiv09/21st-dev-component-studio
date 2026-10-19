'use client';

import React, { useEffect, useRef } from 'react';

export default function RibbonWindTunnel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const ribbons: { offset: number; speed: number; hue: number; amplitude: number }[] = [];
    let time = 0;
    const mouse = { x: 0.5, y: 0.5 };

    for (let i = 0; i < 30; i++) {
      ribbons.push({
        offset: (i / 30) * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
        hue: (i / 30) * 360,
        amplitude: 20 + Math.random() * 30,
      });
    }

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
      ctx.fillStyle = 'rgba(5, 3, 12, 0.06)';
      ctx.fillRect(0, 0, width, height);

      for (const r of ribbons) {
        ctx.beginPath();
        const baseY = height / 2 + Math.sin(r.offset + time * 0.3) * (height * 0.3);
        const step = 3;

        for (let x = 0; x <= width; x += step) {
          const t = x / width;
          const wave = Math.sin(t * 8 + time * r.speed * 3 + r.offset) * r.amplitude;
          const mouseWave = Math.exp(-Math.pow((t - mouse.x) * 4, 2)) * 50 * (mouse.y - 0.5);
          const y = baseY + wave + mouseWave;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `hsla(${r.hue + time * 10}, 80%, 60%, 0.6)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
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
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
