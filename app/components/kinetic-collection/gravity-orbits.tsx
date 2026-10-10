'use client';

import React, { useEffect, useRef } from 'react';

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  hue: number;
  trail: { x: number; y: number }[];
}

export default function GravityOrbits() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const bodies: Body[] = [];

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

    const cx = width / 2;
    const cy = height / 2;
    const sunMass = 8000;

    bodies.push({
      x: cx, y: cy, vx: 0, vy: 0, mass: sunMass, hue: 50, trail: [],
    });

    for (let i = 0; i < 8; i++) {
      const r = 100 + i * 50;
      const angle = (i / 8) * Math.PI * 2;
      const speed = Math.sqrt(sunMass / r) * 0.3;
      bodies.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: -Math.sin(angle) * speed,
        vy: Math.cos(angle) * speed,
        mass: 5,
        hue: 200 + i * 20,
        trail: [],
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(2, 1, 10, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Physics
      for (let i = 1; i < bodies.length; i++) {
        const b = bodies[i];
        let fx = 0, fy = 0;
        for (let j = 0; j < bodies.length; j++) {
          if (i === j) continue;
          const other = bodies[j];
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          const f = (other.mass) / (dist * dist);
          fx += (dx / dist) * f;
          fy += (dy / dist) * f;
        }
        b.vx += fx * 0.5;
        b.vy += fy * 0.5;
      }

      // Update
      for (let i = 1; i < bodies.length; i++) {
        const b = bodies[i];
        b.x += b.vx;
        b.y += b.vy;

        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 50) b.trail.shift();
      }

      // Draw trails
      for (let i = 1; i < bodies.length; i++) {
        const b = bodies[i];
        ctx.beginPath();
        for (let j = 0; j < b.trail.length; j++) {
          const t = b.trail[j];
          if (j === 0) ctx.moveTo(t.x, t.y);
          else ctx.lineTo(t.x, t.y);
        }
        ctx.strokeStyle = `hsla(${b.hue}, 80%, 60%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw bodies
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (i === 0) {
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 60);
          grad.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
          grad.addColorStop(0.5, 'rgba(255, 150, 80, 0.5)');
          grad.addColorStop(1, 'rgba(255, 100, 50, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 60, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 15, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `hsl(${b.hue}, 80%, 70%)`;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();

          const halo = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 12);
          halo.addColorStop(0, `hsla(${b.hue}, 80%, 60%, 0.4)`);
          halo.addColorStop(1, `hsla(${b.hue}, 80%, 60%, 0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#02010a]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
