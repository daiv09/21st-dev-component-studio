'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

export default function MagneticFluxField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const particles: Particle[] = [];
    const mouse = { x: 0, y: 0, active: false };
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => { mouse.active = false; };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    handleResize();

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        life: Math.random() * 200 + 100,
        maxLife: 300,
        trail: [],
      });
    }

    const render = () => {
      time += 0.005;
      ctx.fillStyle = 'rgba(8, 11, 18, 0.08)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const noiseX = Math.sin(time * 0.7) * 80;
      const noiseY = Math.cos(time * 0.5) * 80;

      for (const p of particles) {
        const dx = cx + noiseX - p.x;
        const dy = cy + noiseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const force = 60000 / (dist * dist);
        p.vx += (dx / dist) * force * 0.01;
        p.vy += (dy / dist) * force * 0.01;

        if (mouse.active) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const md = Math.sqrt(mdx * mdx + mdy * mdy) + 0.001;
          if (md < 180) {
            p.vx -= (mdx / md) * (180 - md) * 0.02;
            p.vy -= (mdy / md) * (180 - md) * 0.02;
          }
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.5;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        const hue = (Math.atan2(p.vy, p.vx) * 180) / Math.PI + 180;
        const alpha = Math.min(1, p.life / p.maxLife);

        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        if (p.life <= 0 || p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = (Math.random() - 0.5) * 0.4;
          p.life = p.maxLife;
          p.trail = [];
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#080b12]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center mix-blend-difference text-white">
          <h1 className="font-black text-7xl tracking-tighter">FLUX</h1>
          <p className="text-xs opacity-60 tracking-widest mt-2 font-mono">MAGNETIC PARTICLE FIELD</p>
        </div>
      </div>
    </div>
  );
}
