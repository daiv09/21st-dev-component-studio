'use client';

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
}

export default function VoronoiTessellation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: 0.5, y: 0.5 };
    const points: Point[] = [];
    const numPoints = 25;

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
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        hue: (i / numPoints) * 360,
      });
    }

    const render = () => {
      ctx.fillStyle = '#08080f';
      ctx.fillRect(0, 0, width, height);

      // Update points
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      // Render voronoi cells (approximation)
      const gridSize = 30;
      for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
          let nearest = 0;
          let minDist = Infinity;
          for (let i = 0; i < points.length; i++) {
            const dx = points[i].x - x;
            const dy = points[i].y - y;
            const d = dx * dx + dy * dy;
            if (d < minDist) {
              minDist = d;
              nearest = i;
            }
          }
          const mdx = mouse.x * width - x;
          const mdy = mouse.y * height - y;
          const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
          const alpha = Math.max(0, 0.6 - mouseDist / 400);

          ctx.fillStyle = `hsla(${points[nearest].hue}, 60%, 50%, ${0.3 + alpha * 0.3})`;
          ctx.fillRect(x, y, gridSize - 1, gridSize - 1);
        }
      }

      // Draw cell borders
      ctx.strokeStyle = 'rgba(20, 20, 35, 0.8)';
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const mx = (points[i].x + points[j].x) / 2;
          const my = (points[i].y + points[j].y) / 2;
          const dx = points[j].x - points[i].x;
          const dy = points[j].y - points[i].y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / len;
          const ny = dx / len;
          ctx.beginPath();
          ctx.moveTo(mx - nx * 200, my - ny * 200);
          ctx.lineTo(mx + nx * 200, my + ny * 200);
          ctx.stroke();
        }
      }

      // Draw points
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 80%, 70%)`;
        ctx.fill();
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
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
