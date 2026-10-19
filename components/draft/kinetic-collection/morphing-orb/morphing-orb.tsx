'use client';

import React, { useEffect, useRef } from 'react';

export default function MorphingOrb() {
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
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

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
      mouse.targetX = (e.clientX - rect.left) / width;
      mouse.targetY = (e.clientY - rect.top) / height;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      time += 0.008;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.fillStyle = 'rgba(8, 4, 12, 0.08)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 100;
      const cy = height / 2 + (mouse.y - 0.5) * 100;
      const baseRadius = Math.min(width, height) * 0.2;

      const points = 200;
      for (let layer = 0; layer < 8; layer++) {
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const layerT = time + layer * 0.5;
          const noise = (
            Math.sin(angle * 3 + layerT) * 0.3 +
            Math.cos(angle * 5 - layerT * 0.7) * 0.2 +
            Math.sin(angle * 7 + layerT * 1.3) * 0.1
          );
          const r = baseRadius * (0.6 + layer * 0.07) * (1 + noise * 0.4);
          const x = cx + Math.cos(angle + time * 0.2) * r;
          const y = cy + Math.sin(angle + time * 0.2) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const hue = (layer * 30 + time * 20) % 360;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.5);
        grad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.5)`);
        grad.addColorStop(1, `hsla(${hue + 40}, 70%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.4)`;
        ctx.lineWidth = 0.5;
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
    <div className="relative w-full h-full overflow-hidden bg-[#08040c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
