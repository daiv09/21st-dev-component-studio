'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface MagneticSpringMatrixProps {
  className?: string;
  gridSize?: number;
}

export function MagneticSpringMatrix({
  className,
  gridSize = 20,
}: MagneticSpringMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: -2000, y: -2000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = [];
    let cols = 0;
    let rows = 0;
    let animationId = 0;

    const initGrid = (w: number, h: number) => {
      cols = Math.ceil(w / gridSize);
      rows = Math.ceil(h / gridSize);
      points = [];
      
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          points.push({
            x: x * gridSize,
            y: y * gridSize,
            ox: x * gridSize,
            oy: y * gridSize,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      initGrid(rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of points) {
        // Spring to origin
        const dxOrigin = p.ox - p.x;
        const dyOrigin = p.oy - p.y;
        
        p.vx += dxOrigin * 0.05;
        p.vy += dyOrigin * 0.05;

        // Mouse interaction (magnetic repel)
        const dxMouse = p.x - mx;
        const dyMouse = p.y - my;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        if (distMouse < 150) {
          const force = (150 - distMouse) / 150;
          p.vx += (dxMouse / distMouse) * force * 2;
          p.vy += (dyMouse / distMouse) * force * 2;
        }

        // Friction
        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw dots
      for (const p of points) {
        ctx.beginPath();
        // Calculate size based on velocity for dynamic feel
        const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const radius = Math.min(3, 1 + vel * 0.5);
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [gridSize]);

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
      <div className="absolute bottom-0 left-0 p-6 pointer-events-none mix-blend-difference text-white dark:text-black">
        <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Spring Matrix</h3>
        <p className="font-mono text-xs opacity-70 mt-1">Hooke's Law physics</p>
      </div>
    </div>
  );
}

export default MagneticSpringMatrix;
