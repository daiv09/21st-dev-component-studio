'use client';

import React, { useEffect, useRef } from 'react';

export default function StrangeAttractor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const points: { x: number; y: number; z: number }[] = [];
    const maxPoints = 3000;
    let x = 0.1, y = 0, z = 0;
    const a = 10, b = 28, c = 8 / 3;
    const dt = 0.005;

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
      ctx.fillStyle = 'rgba(2, 0, 10, 0.04)';
      ctx.fillRect(0, 0, width, height);

      // Update Lorenz system
      for (let i = 0; i < 10; i++) {
        const dx = a * (y - x) * dt;
        const dy = (x * (b - z) - y) * dt;
        const dz = (x * y - c * z) * dt;
        x += dx;
        y += dy;
        z += dz;
        points.push({ x, y, z });
        if (points.length > maxPoints) points.shift();
      }

      const cx = width / 2;
      const cy = height / 2;
      const scale = 8;

      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const screenX1 = cx + p1.x * scale;
        const screenY1 = cy + (p1.z - 25) * scale;
        const screenX2 = cx + p2.x * scale;
        const screenY2 = cy + (p2.z - 25) * scale;

        const alpha = i / points.length;
        const hue = (i * 0.3 + p2.x * 5) % 360;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.7})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(screenX1, screenY1);
        ctx.lineTo(screenX2, screenY2);
        ctx.stroke();
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
