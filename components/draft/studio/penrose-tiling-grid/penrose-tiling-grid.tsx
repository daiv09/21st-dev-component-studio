'use client';

import React, { useEffect, useRef } from 'react';

export interface PenroseTilingGridProps {
  scale?: number;
  speed?: number;
  primaryColor?: string;
  accentColor?: string;
  glowIntensity?: number;
}

interface Rhombus {
  points: { x: number; y: number }[];
  type: 'thin' | 'thick';
  energy: number;
  targetEnergy: number;
}

export function PenroseTilingGrid({
  scale = 65,
  speed = 1.0,
  primaryColor = '#06b6d4',
  accentColor = '#f43f5e',
  glowIntensity = 0.8,
}: PenroseTilingGridProps) {
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
    let rhombi: Rhombus[] = [];

    const generatePenroseGrid = (w: number, h: number) => {
      rhombi = [];
      const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
      const cols = Math.ceil(w / scale) + 4;
      const rows = Math.ceil(h / scale) + 4;

      for (let r = -2; r < rows; r++) {
        for (let c = -2; c < cols; c++) {
          const cx = c * scale * 1.2;
          const cy = r * scale * 1.2;

          // Generate thick and thin rhombi in five-fold symmetric pattern
          for (let k = 0; k < 5; k++) {
            const angle = (k * Math.PI) / 2.5;
            const isThick = (r + c + k) % 2 === 0;

            const angleA = angle;
            const angleB = angle + (isThick ? Math.PI / 2.5 : Math.PI / 5);

            const p0 = { x: cx, y: cy };
            const p1 = { x: cx + Math.cos(angleA) * scale, y: cy + Math.sin(angleA) * scale };
            const p3 = { x: cx + Math.cos(angleB) * scale, y: cy + Math.sin(angleB) * scale };
            const p2 = { x: p1.x + Math.cos(angleB) * scale, y: p1.y + Math.sin(angleB) * scale };

            rhombi.push({
              points: [p0, p1, p2, p3],
              type: isThick ? 'thick' : 'thin',
              energy: Math.random() * 0.2,
              targetEnergy: 0,
            });
          }
        }
      }
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      generatePenroseGrid(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const draw = () => {
      time += 0.015 * speed;
      ctx.clearRect(0, 0, width, height);

      // Draw Penrose Rhombi
      for (let i = 0; i < rhombi.length; i++) {
        const item = rhombi[i];
        const center = {
          x: (item.points[0].x + item.points[2].x) / 2,
          y: (item.points[0].y + item.points[2].y) / 2,
        };

        const dist = Math.hypot(center.x - mouseRef.current.x, center.y - mouseRef.current.y);
        const wave = Math.sin(time * 2 + (center.x + center.y) * 0.005) * 0.5 + 0.5;

        if (dist < 180) {
          item.targetEnergy = (1 - dist / 180) * glowIntensity;
        } else {
          item.targetEnergy = wave * 0.15;
        }

        item.energy += (item.targetEnergy - item.energy) * 0.1;

        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        ctx.lineTo(item.points[1].x, item.points[1].y);
        ctx.lineTo(item.points[2].x, item.points[2].y);
        ctx.lineTo(item.points[3].x, item.points[3].y);
        ctx.closePath();

        const baseColor = item.type === 'thick' ? primaryColor : accentColor;
        
        ctx.fillStyle = `${baseColor}${Math.floor(item.energy * 180 + 10).toString(16).padStart(2, '0')}`;
        ctx.fill();

        ctx.strokeStyle = `${baseColor}${Math.floor(item.energy * 255 + 40).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = item.energy > 0.4 ? 1.8 : 0.8;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scale, speed, primaryColor, accentColor, glowIntensity]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}

export default PenroseTilingGrid;
