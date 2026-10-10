'use client';

import React, { useEffect, useRef } from 'react';

export default function QuantumParticleCloud() {
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

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = () => {
      time += 0.005;
      ctx.fillStyle = 'rgba(2, 0, 10, 0.04)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseR = Math.min(width, height) * 0.3;
      const points = 500;

      for (let i = 0; i < points; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = baseR * (0.5 + Math.random() * 0.5);

        const x = cx + r * Math.sin(phi) * Math.cos(theta);
        const y = cy + r * Math.sin(phi) * Math.sin(theta);

        // Quantum jitter
        const jitterX = (Math.random() - 0.5) * 20;
        const jitterY = (Math.random() - 0.5) * 20;

        const size = 0.5 + Math.random() * 1.5;
        const hue = 180 + Math.random() * 100 + time * 10;
        const alpha = 0.5 + Math.random() * 0.5;

        ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x + jitterX, y + jitterY, size, 0, Math.PI * 2);
        ctx.fill();

        // Probabilistic connections
        if (i > 0 && Math.random() > 0.95) {
          const x2 = cx + (Math.random() - 0.5) * baseR * 1.5;
          const y2 = cy + (Math.random() - 0.5) * baseR * 1.5;
          ctx.strokeStyle = `hsla(${hue + 30}, 80%, 60%, 0.2)`;
          ctx.lineWidth = 0.5;
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
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#02000a]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
