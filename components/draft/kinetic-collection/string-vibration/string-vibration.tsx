'use client';

import React, { useEffect, useRef } from 'react';

export default function StringVibration() {
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
    const mouse = { x: 0, y: 0.5, active: false };

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
      mouse.active = true;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / width;
      mouse.y = (e.clientY - rect.top) / height;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    handleResize();

    const render = () => {
      time += 0.025;
      ctx.fillStyle = 'rgba(2, 2, 8, 0.12)';
      ctx.fillRect(0, 0, width, height);

      const stringCount = 12;
      const stringSpacing = height / (stringCount + 1);

      for (let s = 0; s < stringCount; s++) {
        const baseY = (s + 1) * stringSpacing;
        const freq = 0.005 + s * 0.001;
        const amp = 30 + s * 5;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const t = x / width;
          const decay = Math.exp(-Math.pow((t - mouse.x) * 5, 2));
          const dampening = Math.exp(-t * 2);
          let y = baseY + Math.sin(x * freq + time * (3 + s * 0.3)) * amp * 0.3;
          y += decay * dampening * (mouse.y * height - baseY) * Math.sin(t * Math.PI * 4);
          y += Math.sin(t * Math.PI * 6 + time * 2) * 5;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const hue = 180 + s * 12;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Anchor points
        ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(0, baseY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width, baseY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020208]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute bottom-4 left-4 text-xs font-mono text-cyan-300/60">
        MOVE & CLICK TO PLUCK STRINGS
      </div>
    </div>
  );
}
