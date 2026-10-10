'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  hue: number;
  brightness: number;
}

export default function GalaxySpiral() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const stars: Star[] = [];
    const total = 1500;

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

    for (let i = 0; i < total; i++) {
      const arm = i % 4;
      const armAngle = (arm / 4) * Math.PI * 2;
      const t = Math.random();
      const angle = armAngle + t * Math.PI * 4 + (Math.random() - 0.5) * 0.4;
      const radius = t * Math.min(width, height) * 0.45;
      stars.push({
        angle,
        radius,
        speed: 0.0008 + (1 - t) * 0.002,
        size: 0.4 + Math.random() * 1.2,
        hue: 220 + t * 80 + (arm * 20),
        brightness: 0.5 + Math.random() * 0.5,
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(2, 1, 12, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Core glow
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      coreGlow.addColorStop(0, 'rgba(255, 220, 180, 0.8)');
      coreGlow.addColorStop(0.3, 'rgba(255, 150, 100, 0.4)');
      coreGlow.addColorStop(1, 'rgba(255, 100, 80, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      for (const s of stars) {
        s.angle += s.speed;
        const x = cx + Math.cos(s.angle) * s.radius;
        const y = cy + Math.sin(s.angle) * s.radius;

        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 70%, ${60 + s.brightness * 20}%, ${s.brightness})`;
        ctx.fill();

        // Halo
        if (s.size > 0.8) {
          const halo = ctx.createRadialGradient(x, y, 0, x, y, s.size * 4);
          halo.addColorStop(0, `hsla(${s.hue}, 70%, 70%, 0.3)`);
          halo.addColorStop(1, `hsla(${s.hue}, 70%, 70%, 0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(x, y, s.size * 4, 0, Math.PI * 2);
          ctx.fill();
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
    <div className="relative w-full h-full overflow-hidden bg-[#02010c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
