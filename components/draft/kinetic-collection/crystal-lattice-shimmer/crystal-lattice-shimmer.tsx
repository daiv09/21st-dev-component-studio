'use client';

import React, { useEffect, useRef } from 'react';

export default function CrystalLatticeShimmer() {
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
      time += 0.01;
      ctx.fillStyle = 'rgba(8, 6, 16, 0.05)';
      ctx.fillRect(0, 0, width, height);

      const cellSize = 50;
      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize;
          const y = r * cellSize;
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const dx = (c / cols) - mouse.x;
          const dy = (r / rows) - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const shimmer = Math.sin(dist * 8 - time * 3) * 0.5 + 0.5;
          const intensity = Math.max(0, 1 - dist * 2);

          if (shimmer > 0.6) {
            const hue = 200 + dist * 80;
            const alpha = shimmer * intensity;
            const size = cellSize * (0.3 + shimmer * 0.4);

            // Diamond
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx + size * 0.7, cy);
            ctx.lineTo(cx, cy + size);
            ctx.lineTo(cx - size * 0.7, cy);
            ctx.closePath();

            const grad = ctx.createLinearGradient(cx, cy - size, cx, cy + size);
            grad.addColorStop(0, `hsla(${hue}, 80%, 70%, ${alpha * 0.8})`);
            grad.addColorStop(0.5, `hsla(${hue + 30}, 80%, 60%, ${alpha * 0.5})`);
            grad.addColorStop(1, `hsla(${hue + 60}, 80%, 50%, 0)`);
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.strokeStyle = `hsla(${hue}, 80%, 80%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Sparkle cross
            ctx.strokeStyle = `hsla(${hue}, 80%, 90%, ${alpha * 0.8})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(cx - size * 1.2, cy);
            ctx.lineTo(cx + size * 1.2, cy);
            ctx.moveTo(cx, cy - size * 1.2);
            ctx.lineTo(cx, cy + size * 1.2);
            ctx.stroke();
          }
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
    <div className="relative w-full h-full overflow-hidden bg-[#080610]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
