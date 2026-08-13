'use client';

import React, { useEffect, useRef } from 'react';

export interface ChronoDiffractionGridProps {
  gridSpacing?: number;
  rotationSpeed?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function ChronoDiffractionGrid({
  gridSpacing = 26,
  rotationSpeed = 0.4,
  primaryColor = '#3b82f6',
  secondaryColor = '#f43f5e',
}: ChronoDiffractionGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
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
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const drawGridLayer = (angle: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(angle);
      ctx.translate(-width / 2, -height / 2);

      const maxDim = Math.hypot(width, height);
      const startX = (width - maxDim) / 2;
      const startY = (height - maxDim) / 2;

      ctx.beginPath();
      for (let x = startX; x < startX + maxDim; x += gridSpacing) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + maxDim);
      }
      for (let y = startY; y < startY + maxDim; y += gridSpacing) {
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + maxDim, y);
      }

      ctx.strokeStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      time += 0.008 * rotationSpeed;
      ctx.clearRect(0, 0, width, height);

      const mouseAngleShift = mouseRef.current.x > 0 ? (mouseRef.current.x / width) * 0.2 : 0;

      // Layer 1: Clockwise rotation
      drawGridLayer(time + mouseAngleShift, primaryColor, 0.45);

      // Layer 2: Counter-clockwise rotation
      drawGridLayer(-time * 1.3 - mouseAngleShift, secondaryColor, 0.45);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridSpacing, rotationSpeed, primaryColor, secondaryColor]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}

export default ChronoDiffractionGrid;
