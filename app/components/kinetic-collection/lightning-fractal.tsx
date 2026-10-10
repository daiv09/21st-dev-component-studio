'use client';

import React, { useEffect, useRef } from 'react';

interface Bolt {
  segments: { x: number; y: number }[];
  life: number;
  maxLife: number;
}

export default function LightningFractal() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const bolts: Bolt[] = [];
    let timeSinceLast = 0;

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

    const generateBolt = (startX: number, startY: number, endX: number, endY: number, depth: number, segments: { x: number; y: number }[]) => {
      if (depth === 0) {
        segments.push({ x: endX, y: endY });
        return;
      }
      const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 80;
      const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 80;
      generateBolt(startX, startY, midX, midY, depth - 1, segments);
      if (Math.random() > 0.5) {
        const branchX = midX + (Math.random() - 0.5) * 100;
        const branchY = midY + (Math.random() - 0.5) * 100;
        const branch: { x: number; y: number }[] = [{ x: midX, y: midY }];
        generateBolt(midX, midY, branchX, branchY, depth - 1, branch);
        bolts.push({ segments: branch, life: 20, maxLife: 20 });
      }
      generateBolt(midX, midY, endX, endY, depth - 1, segments);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = () => {
      timeSinceLast++;
      ctx.fillStyle = 'rgba(5, 5, 15, 0.18)';
      ctx.fillRect(0, 0, width, height);

      if (timeSinceLast > 30 + Math.random() * 60) {
        timeSinceLast = 0;
        const startX = Math.random() * width;
        const segments: { x: number; y: number }[] = [{ x: startX, y: 0 }];
        generateBolt(startX, 0, Math.random() * width, height, 6, segments);
        bolts.push({ segments, life: 25, maxLife: 25 });
      }

      for (let i = bolts.length - 1; i >= 0; i--) {
        const bolt = bolts[i];
        const alpha = bolt.life / bolt.maxLife;
        ctx.beginPath();
        bolt.segments.forEach((s, idx) => {
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.strokeStyle = `rgba(180, 200, 255, ${alpha * 0.9})`;
        ctx.lineWidth = 2 * alpha;
        ctx.shadowColor = `rgba(120, 180, 255, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner bright core
        ctx.beginPath();
        bolt.segments.forEach((s, idx) => {
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        bolt.life--;
        if (bolt.life <= 0) bolts.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#05050f]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
