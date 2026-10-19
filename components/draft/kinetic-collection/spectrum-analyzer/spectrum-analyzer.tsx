'use client';

import React, { useEffect, useRef } from 'react';

export default function SpectrumAnalyzer() {
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
    const mouse = { x: 0.5 };

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
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      time += 0.02;
      ctx.fillStyle = 'rgba(2, 0, 8, 0.18)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const bars = 64;
      const innerRadius = 80;
      const mouseInfluence = (mouse.x - 0.5) * 200;

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const h1 = Math.abs(Math.sin(time + i * 0.3) * 100 + Math.cos(time * 0.7 + i * 0.2) * 50);
        const h2 = Math.abs(Math.sin(time * 1.5 + i * 0.1) * 30);
        const h = h1 + h2 + mouseInfluence * Math.cos(angle);

        const x1 = cx + Math.cos(angle) * innerRadius;
        const y1 = cy + Math.sin(angle) * innerRadius;
        const x2 = cx + Math.cos(angle) * (innerRadius + h);
        const y2 = cy + Math.sin(angle) * (innerRadius + h);

        const hue = (i / bars) * 360 + time * 30;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.3)`);
        grad.addColorStop(1, `hsla(${hue + 60}, 80%, 70%, 0.9)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius);
      centerGrad.addColorStop(0, 'rgba(20, 20, 30, 1)');
      centerGrad.addColorStop(1, 'rgba(20, 20, 30, 0)');
      ctx.fillStyle = centerGrad;
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
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
