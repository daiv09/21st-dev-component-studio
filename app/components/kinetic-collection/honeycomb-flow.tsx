'use client';

import React, { useEffect, useRef } from 'react';

export default function HoneycombFlow() {
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
      ctx.fillStyle = 'rgba(10, 6, 16, 0.05)';
      ctx.fillRect(0, 0, width, height);

      const hexSize = 35;
      const hexHeight = hexSize * Math.sqrt(3);
      const cols = Math.ceil(width / (hexSize * 1.5)) + 2;
      const rows = Math.ceil(height / hexHeight) + 2;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const x = c * hexSize * 1.5;
          const y = r * hexHeight + (c % 2) * (hexHeight / 2);
          const dx = x / width - mouse.x;
          const dy = y / height - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const wave = Math.sin(dist * 5 - time * 2) * 0.5 + 0.5;
          const fillAlpha = wave * 0.4;
          const scale = 0.7 + wave * 0.3;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = x + Math.cos(angle) * hexSize * scale;
            const py = y + Math.sin(angle) * hexSize * scale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          const hue = 200 + dist * 100 + time * 20;
          ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${fillAlpha})`;
          ctx.fill();

          ctx.strokeStyle = `hsla(${hue + 40}, 80%, 70%, ${0.3 + wave * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
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
    <div className="relative w-full h-full overflow-hidden bg-[#0a0610]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
