'use client';

import React, { useEffect, useRef } from 'react';

export default function PixelDissolveRebuild() {
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
      ctx.fillStyle = 'rgba(2, 4, 12, 0.08)';
      ctx.fillRect(0, 0, width, height);

      const pixelSize = 12;
      const cols = Math.ceil(width / pixelSize);
      const rows = Math.ceil(height / pixelSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * pixelSize;
          const y = r * pixelSize;
          const dx = c / cols - mouse.x;
          const dy = r / rows - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const phase = (c + r) * 0.3 + dist * 6;
          const intensity = Math.max(0, Math.sin(phase - time * 3) * 0.5 + 0.5);
          const isActive = intensity > 0.4;
          const fadeIn = Math.max(0, Math.sin(phase - time * 3 + 0.5));

          if (isActive) {
            const hue = 200 + dist * 100 + time * 20;
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;
            ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
          } else if (fadeIn > 0.3) {
            const hue = 280 + dist * 60;
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${fadeIn * 0.5})`;
            ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
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
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
