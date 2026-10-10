'use client';

import React, { useEffect, useRef } from 'react';

export default function PlasmaOrb() {
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
      time += 0.01;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.fillStyle = '#0a0612';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 60;
      const cy = height / 2 + (mouse.y - 0.5) * 60;
      const radius = Math.min(width, height) * 0.28;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.4);
      outerGlow.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
      outerGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, width, height);

      // Plasma layers
      for (let layer = 0; layer < 6; layer++) {
        const layerTime = time * (1 + layer * 0.3);
        const layerRadius = radius * (0.4 + layer * 0.1);

        ctx.beginPath();
        const points = 80;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise = Math.sin(angle * 3 + layerTime) * Math.cos(angle * 5 - layerTime * 0.7) * 0.3;
          const r = layerRadius * (1 + noise * 0.4);
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerRadius * 1.5);
        const hue = (200 + layer * 30 + time * 20) % 360;
        grad.addColorStop(0, `hsla(${hue}, 90%, 60%, 0.4)`);
        grad.addColorStop(0.6, `hsla(${hue + 40}, 80%, 50%, 0.15)`);
        grad.addColorStop(1, `hsla(${hue}, 70%, 40%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.3);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGrad.addColorStop(0.3, 'rgba(244, 114, 182, 0.6)');
      coreGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
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
