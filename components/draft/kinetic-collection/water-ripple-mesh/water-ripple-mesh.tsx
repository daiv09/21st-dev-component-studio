'use client';

import React, { useEffect, useRef } from 'react';

export default function WaterRippleMesh() {
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
      time += 0.012;
      ctx.fillStyle = 'rgba(0, 8, 20, 0.1)';
      ctx.fillRect(0, 0, width, height);

      const cols = 30;
      const rows = 30;
      const cellW = width / cols;
      const cellH = height / rows;
      const points: { x: number; y: number }[] = [];

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          const wave = (
            Math.sin(x * 0.01 + time) +
            Math.cos(y * 0.015 - time * 0.7) +
            Math.sin((x + y) * 0.008 + time * 0.5) +
            Math.cos(Math.sqrt(x * x + y * y) * 0.005 - time)
          ) * 25;
          points.push({ x, y: y + wave });
        }
      }

      // Draw quads
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * (cols + 1) + c;
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[i + cols + 2];
          const p4 = points[i + cols + 1];

          const centerY = (p1.y + p3.y) / 2;
          const depth = (centerY - r * cellH) / 50;
          const hue = 200 + depth * 30;
          const alpha = 0.3 + Math.abs(depth);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();

          ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha * 0.4})`;
          ctx.fill();

          ctx.strokeStyle = `hsla(${hue + 20}, 80%, 70%, ${0.3 + Math.abs(depth) * 0.4})`;
          ctx.lineWidth = 0.5;
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
    <div className="relative w-full h-full overflow-hidden bg-[#000814]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
