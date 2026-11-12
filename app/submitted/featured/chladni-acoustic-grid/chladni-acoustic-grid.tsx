'use client';

import React, { useEffect, useRef } from 'react';

export interface ChladniAcousticGridProps {
  gridResolution?: number;
  frequencyX?: number;
  frequencyY?: number;
  nodeColor?: string;
  waveColor?: string;
}

export function ChladniAcousticGrid({
  gridResolution = 48,
  frequencyX = 4,
  frequencyY = 3,
  nodeColor = '#ec4899',
  waveColor = '#06b6d4',
}: ChladniAcousticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

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
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = Math.max(0.1, Math.min(1, (e.clientX - rect.left) / rect.width));
      mouseRef.current.y = Math.max(0.1, Math.min(1, (e.clientY - rect.top) / rect.height));
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const m = Math.floor(frequencyX + mouseRef.current.x * 5);
      const n = Math.floor(frequencyY + mouseRef.current.y * 5);

      const cellW = width / gridResolution;
      const cellH = height / gridResolution;

      for (let r = 0; r < gridResolution; r++) {
        for (let c = 0; c < gridResolution; c++) {
          const xNorm = (c / gridResolution - 0.5) * Math.PI * 2;
          const yNorm = (r / gridResolution - 0.5) * Math.PI * 2;

          // Chladni 2D Standing Wave Function
          const val =
            Math.sin(n * xNorm + time) * Math.sin(m * yNorm + time * 0.5) -
            Math.sin(m * xNorm + time * 0.5) * Math.sin(n * yNorm + time);

          const absVal = Math.abs(val);
          const px = c * cellW + cellW / 2;
          const py = r * cellH + cellH / 2;

          if (absVal < 0.15) {
            // Nodal lines (sand gathering points)
            ctx.beginPath();
            ctx.arc(px, py, (1 - absVal / 0.15) * 3, 0, Math.PI * 2);
            ctx.fillStyle = nodeColor;
            ctx.fill();
          } else {
            // Anti-nodal wave displacement vectors
            const lineLen = Math.min(cellW, cellH) * 0.4 * absVal;
            const angle = val * Math.PI;

            ctx.beginPath();
            ctx.moveTo(px - Math.cos(angle) * lineLen, py - Math.sin(angle) * lineLen);
            ctx.lineTo(px + Math.cos(angle) * lineLen, py + Math.sin(angle) * lineLen);
            
            ctx.strokeStyle = waveColor;
            ctx.globalAlpha = Math.min(1, absVal * 0.6);
            ctx.lineWidth = 1.1;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
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
  }, [gridResolution, frequencyX, frequencyY, nodeColor, waveColor]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
  );
}

export default ChladniAcousticGrid;