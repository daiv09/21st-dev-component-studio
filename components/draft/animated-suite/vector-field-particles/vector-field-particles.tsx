'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface VectorFieldParticlesProps {
  className?: string;
  particleCount?: number;
}

// Simple pseudo-random hash function for noise
function hash(x: number, y: number): number {
  let val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return val - Math.floor(val);
}

// Interpolated noise function
function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);

  return a * (1 - ux) + b * ux + (c - a) * uy * (1 - ux) + (d - b) * ux * uy;
}

export function VectorFieldParticles({
  className,
  particleCount = 1000,
}: VectorFieldParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: -2000, y: -2000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    let animationId = 0;
    let time = 0;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          life: Math.random(),
        });
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const draw = () => {
      time += 0.002;
      
      const isDark = document.documentElement.classList.contains('dark');
      
      // Trail effect
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      particles.forEach((p) => {
        // Vector field math
        const angle = noise(p.x * 0.003, p.y * 0.003 + time) * Math.PI * 4;
        
        let targetVx = Math.cos(angle);
        let targetVy = Math.sin(angle);

        // Mouse interaction (repulsion)
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          targetVx += (dx / dist) * force * 5;
          targetVy += (dy / dist) * force * 5;
        }

        p.vx += (targetVx - p.vx) * 0.1;
        p.vy += (targetVy - p.vy) * 0.1;

        p.x += p.vx * 2;
        p.y += p.vy * 2;

        p.life -= 0.005;

        // Wrap around edges or respawn
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life <= 0) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 1;
          p.vx = 0;
          p.vy = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [particleCount]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[500px] overflow-hidden bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm",
        className
      )}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          mouseRef.current.x = e.clientX - rect.left;
          mouseRef.current.y = e.clientY - rect.top;
        }
      }}
      onMouseLeave={() => {
        mouseRef.current.x = -2000;
        mouseRef.current.y = -2000;
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
      
      {/* Optional Overlay Text */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 mix-blend-difference text-white dark:text-black">
        <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Vector Field</h3>
        <p className="font-mono text-xs opacity-70">Mathematical flow simulation</p>
      </div>
    </div>
  );
}

export default VectorFieldParticles;
