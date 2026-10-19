'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface LissajousCurveGeneratorProps {
  className?: string;
}

export function LissajousCurveGenerator({
  className,
}: LissajousCurveGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;
    let time = 0;

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
      time += 0.01;
      const isDark = document.documentElement.classList.contains('dark');
      
      // Clear with slight trailing effect
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Mouse influence on frequencies
      const freqX = 3 + mouseRef.current.x * 5;
      const freqY = 2 + mouseRef.current.y * 5;
      const phase = Math.PI / 2 + time; // Shift phase over time

      ctx.beginPath();
      const resolution = 200;
      const cx = width / 2;
      const cy = height / 2;
      const amplitudeX = cx * 0.8;
      const amplitudeY = cy * 0.8;

      for (let i = 0; i <= resolution; i++) {
        const t = (i / resolution) * Math.PI * 2;
        const x = cx + amplitudeX * Math.sin(freqX * t + phase);
        const y = cy + amplitudeY * Math.sin(freqY * t);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
      ctx.lineWidth = 2;
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
          mouseRef.current.x = (e.clientX - rect.left) / rect.width;
          mouseRef.current.y = (e.clientY - rect.top) / rect.height;
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
      <div className="absolute top-0 left-0 p-6 pointer-events-none mix-blend-difference text-white dark:text-black">
        <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Lissajous</h3>
        <p className="font-mono text-xs opacity-70 mt-1">Parametric interference</p>
      </div>
    </div>
  );
}

export default LissajousCurveGenerator;
