'use client';

import React, { useEffect, useRef } from 'react';

export default function EtherealWisp() {
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
    const wisps: { phase: number; speed: number; amplitude: number; hue: number; yBase: number }[] = [];

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

    for (let i = 0; i < 5; i++) {
      wisps.push({
        phase: i * 1.2,
        speed: 0.3 + i * 0.1,
        amplitude: 100 + i * 30,
        hue: 200 + i * 30,
        yBase: 0.2 + i * 0.15,
      });
    }

    const render = () => {
      time += 0.012;
      ctx.fillStyle = 'rgba(2, 0, 8, 0.05)';
      ctx.fillRect(0, 0, width, height);

      for (const w of wisps) {
        const points = 100;
        const mouseInfluence = (mouse.y - 0.5) * 50;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const x = t * width;
          const wave = (
            Math.sin(t * 6 + time * w.speed + w.phase) * 0.5 +
            Math.cos(t * 10 - time * 0.7 + w.phase) * 0.3 +
            Math.sin(t * 16 + time * 1.3) * 0.2
          ) * w.amplitude;
          const y = height * w.yBase + wave + mouseInfluence;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        for (let i = points; i >= 0; i--) {
          const t = i / points;
          const x = t * width;
          const wave = (
            Math.sin(t * 6 + time * w.speed + w.phase) * 0.5 +
            Math.cos(t * 10 - time * 0.7 + w.phase) * 0.3
          ) * w.amplitude;
          const y = height * w.yBase + wave + mouseInfluence + 40;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, `hsla(${w.hue}, 70%, 50%, 0)`);
        grad.addColorStop(0.5, `hsla(${w.hue}, 80%, 70%, 0.3)`);
        grad.addColorStop(1, `hsla(${w.hue + 30}, 70%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Top edge glow
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const x = t * width;
          const wave = (
            Math.sin(t * 6 + time * w.speed + w.phase) * 0.5 +
            Math.cos(t * 10 - time * 0.7 + w.phase) * 0.3 +
            Math.sin(t * 16 + time * 1.3) * 0.2
          ) * w.amplitude;
          const y = height * w.yBase + wave + mouseInfluence;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${w.hue}, 80%, 80%, 0.6)`;
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
    <div className="relative w-full h-full overflow-hidden bg-[#020008]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
