'use client';

import React, { useEffect, useRef } from 'react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: [number, number, number];
}

export default function MetaballBlobs() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: 0.5, y: 0.5, active: false };
    const balls: Ball[] = [
      { x: 0.2, y: 0.3, vx: 0.003, vy: 0.002, radius: 80, color: [255, 100, 200] },
      { x: 0.7, y: 0.6, vx: -0.002, vy: 0.003, radius: 100, color: [100, 150, 255] },
      { x: 0.4, y: 0.8, vx: 0.002, vy: -0.002, radius: 90, color: [150, 100, 255] },
      { x: 0.8, y: 0.2, vx: -0.003, vy: 0.002, radius: 75, color: [255, 200, 100] },
    ];

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
      mouse.x = (e.clientX - rect.left) / width;
      mouse.y = (e.clientY - rect.top) / height;
      mouse.active = true;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);

      // Update positions
      for (const b of balls) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0.1 || b.x > 0.9) b.vx *= -1;
        if (b.y < 0.1 || b.y > 0.9) b.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - b.x;
          const dy = mouse.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.3) {
            b.vx -= dx * 0.001;
            b.vy -= dy * 0.001;
          }
        }

        b.vx = Math.max(-0.005, Math.min(0.005, b.vx));
        b.vy = Math.max(-0.005, Math.min(0.005, b.vy));
      }

      // Metaball field
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      const step = 4;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          let totalR = 0, totalG = 0, totalB = 0, totalW = 0;
          for (const ball of balls) {
            const bx = ball.x * width;
            const by = ball.y * height;
            const dx = x - bx;
            const dy = y - by;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const w = (ball.radius * ball.radius) / (dist * dist);
            totalR += ball.color[0] * w;
            totalG += ball.color[1] * w;
            totalB += ball.color[2] * w;
            totalW += w;
          }
          const intensity = Math.min(1, totalW * 0.003);
          if (intensity > 0.3) {
            const r = totalR / totalW;
            const g = totalG / totalW;
            const b = totalB / totalW;
            for (let dy = 0; dy < step; dy++) {
              for (let dx = 0; dx < step; dx++) {
                const idx = ((y + dy) * width + (x + dx)) * 4;
                data[idx] = r * intensity;
                data[idx + 1] = g * intensity;
                data[idx + 2] = b * intensity;
                data[idx + 3] = 255;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
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
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
