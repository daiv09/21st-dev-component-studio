'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface FluidRippleMeshProps {
  className?: string;
  resolution?: number; // Distance between points
}

export function FluidRippleMesh({
  className,
  resolution = 20,
}: FluidRippleMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Two buffers for wave equation
  const uRef = useRef<number[][]>([]);
  const vRef = useRef<number[][]>([]);
  const mouseRef = useRef({ x: -2000, y: -2000, isDown: false, prevX: -2000, prevY: -2000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let animationId = 0;

    const initBuffers = (w: number, h: number) => {
      cols = Math.floor(w / resolution);
      rows = Math.floor(h / resolution);
      
      uRef.current = Array.from({ length: rows }, () => Array(cols).fill(0));
      vRef.current = Array.from({ length: rows }, () => Array(cols).fill(0));
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      initBuffers(rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const draw = () => {
      const u = uRef.current;
      const v = vRef.current;
      
      if (!u.length || !v.length) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      // Add mouse disturbance
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      
      if (mx > 0 && my > 0) {
        const cx = Math.floor(mx / resolution);
        const cy = Math.floor(my / resolution);
        
        // Splash radius
        for(let i = -2; i <= 2; i++) {
          for(let j = -2; j <= 2; j++) {
            if (cy+i >= 1 && cy+i < rows-1 && cx+j >= 1 && cx+j < cols-1) {
              const dist = Math.sqrt(i*i + j*j);
              if (dist < 2.5) {
                u[cy+i][cx+j] = 200 * (1 - dist/2.5); // splash force
              }
            }
          }
        }
      }

      // Update wave equation
      // damping factor
      const damping = 0.98;
      
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          // 2D Wave equation approximation
          v[y][x] = (
            u[y-1][x] + 
            u[y+1][x] + 
            u[y][x-1] + 
            u[y][x+1]
          ) / 2 - v[y][x];
          
          v[y][x] *= damping;
        }
      }
      
      // Swap buffers
      const temp = uRef.current;
      uRef.current = vRef.current;
      vRef.current = temp;

      const isDark = document.documentElement.classList.contains('dark');
      
      ctx.fillStyle = isDark ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;

      // Draw mesh
      ctx.beginPath();
      
      // Horizontal lines
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * resolution;
          // Z displacement maps to Y offset for fake 3D
          const py = y * resolution - (uRef.current[y]?.[x] || 0);
          
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      
      // Vertical lines
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const px = x * resolution;
          const py = y * resolution - (uRef.current[y]?.[x] || 0);
          
          if (y === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [resolution]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[500px] overflow-hidden bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm touch-none",
        className
      )}
      onPointerDown={() => mouseRef.current.isDown = true}
      onPointerUp={() => mouseRef.current.isDown = false}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        mouseRef.current.x = -2000;
        mouseRef.current.y = -2000;
        mouseRef.current.isDown = false;
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
      
      <div className="absolute top-0 right-0 p-6 pointer-events-none mix-blend-difference text-white dark:text-black text-right">
        <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Ripple Mesh</h3>
        <p className="font-mono text-xs opacity-70 mt-1">Wave equation solver</p>
      </div>
    </div>
  );
}

export default FluidRippleMesh;
