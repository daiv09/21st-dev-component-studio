'use client';

import React, { useEffect, useRef } from 'react';

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
}

export default function BoidsFlocking() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const boids: Boid[] = [];
    const count = 80;
    const mouse = { x: 0.5, y: 0.5, active: false };

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

    for (let i = 0; i < count; i++) {
      boids.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        hue: 180 + (i / count) * 100,
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(5, 8, 20, 0.06)';
      ctx.fillRect(0, 0, width, height);

      for (const b of boids) {
        let alignX = 0, alignY = 0, alignCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;
        let sepX = 0, sepY = 0;

        for (const other of boids) {
          if (other === b) continue;
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            alignX += other.vx;
            alignY += other.vy;
            alignCount++;
          }
          if (dist < 100) {
            cohX += other.x;
            cohY += other.y;
            cohCount++;
          }
          if (dist < 30) {
            sepX -= dx / dist;
            sepY -= dy / dist;
          }
        }

        if (alignCount > 0) {
          b.vx += (alignX / alignCount - b.vx) * 0.01;
          b.vy += (alignY / alignCount - b.vy) * 0.01;
        }
        if (cohCount > 0) {
          b.vx += (cohX / cohCount - b.x) * 0.0005;
          b.vy += (cohY / cohCount - b.y) * 0.0005;
        }
        b.vx += sepX * 0.1;
        b.vy += sepY * 0.1;

        if (mouse.active) {
          const dx = mouse.x * width - b.x;
          const dy = mouse.y * height - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            b.vx += (dx / dist) * 0.2;
            b.vy += (dy / dist) * 0.2;
          }
        }

        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const maxSpeed = 4;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0) b.x = width;
        if (b.x > width) b.x = 0;
        if (b.y < 0) b.y = height;
        if (b.y > height) b.y = 0;

        // Draw triangle
        const angle = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-5, -4);
        ctx.lineTo(-5, 4);
        ctx.closePath();
        ctx.fillStyle = `hsl(${b.hue}, 80%, 60%)`;
        ctx.fill();
        ctx.restore();
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
    <div className="relative w-full h-full overflow-hidden bg-[#05081a]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
