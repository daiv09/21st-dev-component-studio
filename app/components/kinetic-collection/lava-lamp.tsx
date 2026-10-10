'use client';

import React, { useEffect, useRef } from 'react';

export default function LavaLamp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;
    const mouse = { x: 0.5, y: 0.5 };
    const blobs: { x: number; y: number; vx: number; vy: number; radius: number; hue: number }[] = [];

    for (let i = 0; i < 12; i++) {
      blobs.push({
        x: 0.5,
        y: 0.5,
        vx: (Math.random() - 0.5) * 0.005,
        vy: -0.005 - Math.random() * 0.005,
        radius: 30 + Math.random() * 30,
        hue: i * 30,
      });
    }

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

    const render = () => {
      time += 0.012;
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, width, height);

      // Update blobs
      for (const b of blobs) {
        b.x += b.vx + Math.sin(time + b.y * 5) * 0.002;
        b.y += b.vy;
        b.vy += 0.0001;

        if (b.y < 0.1) b.vy = Math.abs(b.vy) * 0.8;
        if (b.y > 0.9) b.vy = -Math.abs(b.vy) * 0.8;
        if (b.x < 0.2) b.vx = Math.abs(b.vx);
        if (b.x > 0.8) b.vx = -Math.abs(b.vx);
      }

      // Render metaball-like blobs
      for (let i = 0; i < blobs.length; i++) {
        const b1 = blobs[i];
        const x1 = b1.x * width;
        const y1 = b1.y * height;

        for (let j = i + 1; j < blobs.length; j++) {
          const b2 = blobs[j];
          const x2 = b2.x * width;
          const y2 = b2.y * height;
          const dx = x1 - x2;
          const dy = y1 - y2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < b1.radius + b2.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${b1.hue}, 70%, 60%, ${0.3 - dist / (b1.radius + b2.radius) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // Draw blobs
      for (const b of blobs) {
        const x = b.x * width;
        const y = b.y * height;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.radius);
        grad.addColorStop(0, `hsla(${b.hue}, 80%, 60%, 0.8)`);
        grad.addColorStop(0.6, `hsla(${b.hue}, 80%, 50%, 0.5)`);
        grad.addColorStop(1, `hsla(${b.hue}, 80%, 40%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${b.hue}, 80%, 80%, 0.6)`;
        ctx.beginPath();
        ctx.arc(x - b.radius * 0.3, y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
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
