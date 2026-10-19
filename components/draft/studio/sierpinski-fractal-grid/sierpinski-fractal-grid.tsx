'use client';

import React, { useEffect, useRef } from 'react';

export interface SierpinskiFractalGridProps {
  maxDepth?: number;
  speed?: number;
  glowColor?: string;
  lineColor?: string;
}

export function SierpinskiFractalGrid({
  maxDepth = 4,
  speed = 0.5,
  glowColor = '#f43f5e',
  lineColor = '#6366f1',
}: SierpinskiFractalGridProps) {
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

    const drawTriangle = (
      ax: number, ay: number,
      bx: number, by: number,
      cx: number, cy: number,
      depth: number
    ) => {
      if (depth <= 0) return;

      const centerX = (ax + bx + cx) / 3;
      const centerY = (ay + by + cy) / 3;
      const dist = Math.hypot(centerX - mouseRef.current.x, centerY - mouseRef.current.y);

      const isMouseNear = dist < 220;
      const alpha = isMouseNear ? Math.max(0.2, 1 - dist / 220) : 0.25;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cx, cy);
      ctx.closePath();

      ctx.strokeStyle = isMouseNear ? glowColor : `${lineColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = depth * 0.7;
      ctx.stroke();

      if (isMouseNear && depth === maxDepth) {
        ctx.fillStyle = `${glowColor}22`;
        ctx.fill();
      }

      // Calculate midpoints
      const abx = (ax + bx) / 2;
      const aby = (ay + by) / 2;
      const bcx = (bx + cx) / 2;
      const bcy = (by + cy) / 2;
      const cax = (cx + ax) / 2;
      const cay = (cy + ay) / 2;

      drawTriangle(ax, ay, abx, aby, cax, cay, depth - 1);
      drawTriangle(abx, aby, bx, by, bcx, bcy, depth - 1);
      drawTriangle(cax, cay, bcx, bcy, cx, cy, depth - 1);
    };

    const draw = () => {
      time += 0.01 * speed;
      ctx.clearRect(0, 0, width, height);

      const size = Math.min(width, height) * 0.75;
      const centerX = width / 2;
      const centerY = height / 2 + size * 0.1;

      const h = size * (Math.sqrt(3) / 2);

      // Rotating base triangle vertices
      const angle = Math.sin(time) * 0.1;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const rot = (x: number, y: number) => {
        const dx = x - centerX;
        const dy = y - centerY;
        return {
          x: centerX + dx * cosA - dy * sinA,
          y: centerY + dx * sinA + dy * cosA,
        };
      };

      const pA = rot(centerX, centerY - (2 / 3) * h);
      const pB = rot(centerX - size / 2, centerY + (1 / 3) * h);
      const pC = rot(centerX + size / 2, centerY + (1 / 3) * h);

      drawTriangle(pA.x, pA.y, pB.x, pB.y, pC.x, pC.y, maxDepth);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [maxDepth, speed, glowColor, lineColor]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}

export default SierpinskiFractalGrid;
