'use client';

import React, { useEffect, useRef } from 'react';

export default function BinaryRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const columns: { y: number; speed: number; chars: string[] }[] = [];
    const mouse = { x: 0.5, y: 0.5 };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      columns.length = 0;
      const fontSize = 14;
      for (let x = 0; x < width; x += fontSize) {
        const chars: string[] = [];
        for (let i = 0; i < 30; i++) {
          chars.push(Math.random() > 0.5 ? '1' : '0');
        }
        columns.push({
          y: Math.random() * height,
          speed: 1 + Math.random() * 2,
          chars,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / width;
      mouse.y = (e.clientY - rect.top) / height;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '14px monospace';

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.y += col.speed;
        if (col.y > height + 200) {
          col.y = -200;
          col.chars = col.chars.map(() => (Math.random() > 0.5 ? '1' : '0'));
        }

        const x = i * 14;
        const mouseInfluence = Math.exp(-Math.pow((x / width - mouse.x) * 5, 2));

        for (let j = 0; j < col.chars.length; j++) {
          const y = col.y - j * 16;
          if (y < 0 || y > height) continue;

          const alpha = 1 - j / col.chars.length;
          const isHead = j === 0;
          const color = isHead ? '#a7f3d0' : `rgba(34, 197, 94, ${alpha})`;

          ctx.fillStyle = isHead
            ? `rgba(167, 243, 208, ${0.9 + mouseInfluence * 0.1})`
            : color;
          ctx.fillText(col.chars[j], x, y);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
