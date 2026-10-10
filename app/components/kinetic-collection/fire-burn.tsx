'use client';

import React, { useEffect, useRef } from 'react';

export default function FireBurn() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];
    const mouse = { x: 0.5, y: 0.5, down: false };

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

    const handleMouseDown = () => { mouse.down = true; };
    const handleMouseUp = () => { mouse.down = false; };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    handleResize();

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Spawn particles
      if (mouse.down || Math.random() > 0.3) {
        const baseX = mouse.x * width;
        const baseY = mouse.y * height;
        for (let i = 0; i < 5; i++) {
          particles.push({
            x: baseX + (Math.random() - 0.5) * 20,
            y: baseY,
            vx: (Math.random() - 0.5) * 1,
            vy: -Math.random() * 3 - 1,
            life: 50 + Math.random() * 50,
            maxLife: 100,
            size: 8 + Math.random() * 10,
          });
        }
      }

      // Update and draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02;
        p.vx *= 0.98;
        p.life--;
        p.size *= 0.97;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const t = 1 - p.life / p.maxLife;
        const hue = 30 - t * 30;
        const alpha = p.life / p.maxLife;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `hsla(${hue}, 100%, 70%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${hue + 10}, 100%, 50%, ${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${hue + 20}, 100%, 30%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
      <div className="absolute bottom-4 left-4 text-xs font-mono text-orange-300/60">
        CLICK & HOLD TO IGNITE
      </div>
    </div>
  );
}
