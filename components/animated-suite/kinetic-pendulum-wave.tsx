'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface KineticPendulumWaveProps {
  className?: string;
  pendulumCount?: number;
}

export function KineticPendulumWave({
  className,
  pendulumCount = 15,
}: KineticPendulumWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
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
      time += 0.02;
      const isDark = document.documentElement.classList.contains('dark');
      
      ctx.fillStyle = isDark ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.lineWidth = 1;

      const originX = width / 2;
      const originY = 50;
      
      // Draw pivot
      ctx.beginPath();
      ctx.arc(originX, originY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Physics constants for uncoupled pendulum wave
      // T_n = T_max / (N + n)
      // Length L_n proportional to T_n^2
      
      for (let i = 0; i < pendulumCount; i++) {
        // Frequency increases slightly for each successive pendulum
        const freq = 1 + i * 0.05; 
        const maxAngle = Math.PI / 4;
        const angle = maxAngle * Math.cos(freq * time);
        
        // Visual length
        const length = 100 + i * (Math.min(height - 150, 400) / pendulumCount);
        
        const px = originX + Math.sin(angle) * length;
        const py = originY + Math.cos(angle) * length;

        // Draw string
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Draw bob
        ctx.beginPath();
        ctx.arc(px, py, 6 + i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [pendulumCount]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[500px] overflow-hidden bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm",
        className
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      <div className="absolute bottom-0 right-0 p-6 pointer-events-none mix-blend-difference text-white dark:text-black text-right">
        <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Pendulum Wave</h3>
        <p className="font-mono text-xs opacity-70 mt-1">Uncoupled harmonic oscillators</p>
      </div>
    </div>
  );
}

export default KineticPendulumWave;
