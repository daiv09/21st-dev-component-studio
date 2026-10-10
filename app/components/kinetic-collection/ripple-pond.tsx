'use client';

import React, { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  hue: number;
}

export default function RipplePond() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const ripples: Ripple[] = [];
    const mouse = { x: 0.5, y: 0.5, lastClick: 0 };
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

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.push({
        x, y,
        radius: 0,
        maxRadius: 300 + Math.random() * 200,
        alpha: 0.8,
        hue: 180 + Math.random() * 100,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / width;
      mouse.y = (e.clientY - rect.top) / height;

      if (time - mouse.lastClick > 0.5) {
        mouse.lastClick = time;
        ripples.push({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          radius: 0,
          maxRadius: 100,
          alpha: 0.3,
          hue: 200 + Math.random() * 60,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    handleResize();

    const render = () => {
      time += 0.016;
      ctx.fillStyle = 'rgba(5, 10, 20, 0.1)';
      ctx.fillRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3;
        r.alpha *= 0.985;

        if (r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${r.hue}, 80%, 60%, ${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Second ring
        if (r.radius > 10) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${r.hue}, 80%, 70%, ${r.alpha * 0.6})`;
          ctx.lineWidth = 1.5;
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
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050a14]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute bottom-4 left-4 text-xs font-mono text-cyan-300/60">
        MOVE & CLICK TO CREATE RIPPLES
      </div>
    </div>
  );
}
