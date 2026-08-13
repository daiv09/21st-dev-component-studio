'use client';

import React, { useEffect, useRef } from 'react';

export interface KagomeLatticeGridProps {
  starSize?: number;
  spinSpeed?: number;
  starColor?: string;
  glowColor?: string;
}

export function KagomeLatticeGrid({
  starSize = 42,
  spinSpeed = 0.8,
  starColor = '#a855f7',
  glowColor = '#3b82f6',
}: KagomeLatticeGridProps) {
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

    const drawKagomeStar = (cx: number, cy: number, r: number, rotation: number, isHovered: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // Kagome Star of David (2 overlapping triangles)
      for (let t = 0; t < 2; t++) {
        const offsetAngle = (t * Math.PI) / 3;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = offsetAngle + (i * 2 * Math.PI) / 3;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.strokeStyle = isHovered ? glowColor : `${starColor}66`;
        ctx.lineWidth = isHovered ? 2.2 : 1;
        ctx.stroke();

        if (isHovered) {
          ctx.fillStyle = `${glowColor}22`;
          ctx.fill();
        }
      }

      ctx.restore();
    };

    const draw = () => {
      time += 0.012 * spinSpeed;
      ctx.clearRect(0, 0, width, height);

      const xSpacing = starSize * 2.5;
      const ySpacing = starSize * 2.165;
      const cols = Math.ceil(width / xSpacing) + 2;
      const rows = Math.ceil(height / ySpacing) + 2;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const xOffset = (r % 2) * (xSpacing / 2);
          const cx = c * xSpacing + xOffset;
          const cy = r * ySpacing;

          const dist = Math.hypot(cx - mouseRef.current.x, cy - mouseRef.current.y);
          const isHovered = dist < 170;
          const spin = time + ((c + r) % 2 === 0 ? 1 : -1) * time * 0.5;

          drawKagomeStar(cx, cy, starSize, spin, isHovered);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starSize, spinSpeed, starColor, glowColor]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}

export default KagomeLatticeGrid;
