'use client';

import React, { useEffect, useRef } from 'react';

export default function NeonTunnel() {
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
      z += 1.5;
      const cx = width / 2;
      const cy = height / 2;

      // Trail effect
      ctx.fillStyle = 'rgba(2, 0, 8, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Concentric rings
      for (let i = 0; i < 30; i++) {
        const depth = ((i * 30 + z) % 900) / 900;
        if (depth === 0) continue;
        const scale = 1 / depth;
        const ringSize = Math.min(width, height) * scale;

        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const x = cx + Math.cos(a) * ringSize;
          const y = cy + Math.sin(a) * ringSize;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const hue = (i * 12 + z) % 360;
        const alpha = (1 - depth) * 0.7;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Center vanishing point
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
      centerGlow.addColorStop(0, 'rgba(255, 200, 255, 0.9)');
      centerGlow.addColorStop(0.5, 'rgba(200, 100, 255, 0.4)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020008]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
