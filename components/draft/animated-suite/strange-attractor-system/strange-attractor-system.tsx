'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface StrangeAttractorSystemProps {
  className?: string;
}

export function StrangeAttractorSystem({
  className,
}: StrangeAttractorSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ rx: 0, ry: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;

    // Lorenz attractor parameters
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    let x = 0.1, y = 0, z = 0;
    const dt = 0.01;

    // Precompute trace
    const maxPoints = 2000;
    const trace: { x: number; y: number; z: number }[] = [];

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
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const draw = () => {
      // Step physics
      for (let i = 0; i < 5; i++) {
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        x += dx;
        y += dy;
        z += dz;
        
        trace.push({ x, y, z });
        if (trace.length > maxPoints) trace.shift();
      }

      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;

      // Simple 3D projection
      const scale = Math.min(width, height) / 60;
      const cx = width / 2;
      const cy = height / 2;
      
      const rotX = mouseRef.current.rx;
      const rotY = mouseRef.current.ry;

      ctx.beginPath();
      for (let i = 0; i < trace.length; i++) {
        const p = trace[i];
        
        // Rotate around Y axis
        const x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        const z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        
        // Rotate around X axis
        const y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);
        
        // Project
        const px = cx + x1 * scale;
        // Shift Z so it centers better visually
        const py = cy + (y2 - 25) * scale;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

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
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          mouseRef.current.ry = nx * Math.PI; // rotate Y based on X mouse
          mouseRef.current.rx = ny * Math.PI; // rotate X based on Y mouse
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-move" />
      <div className="absolute top-0 right-0 p-6 pointer-events-none mix-blend-difference text-white dark:text-black text-right">
        <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Strange Attractor</h3>
        <p className="font-mono text-xs opacity-70 mt-1">Lorenz chaotic system</p>
      </div>
    </div>
  );
}

export default StrangeAttractorSystem;
