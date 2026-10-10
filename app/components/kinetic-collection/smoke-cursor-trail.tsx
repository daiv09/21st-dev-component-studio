'use client';

import React, { useEffect, useRef } from 'react';

export default function SmokeCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const particles: { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number }[] = [];
    const mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, down: false };

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
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = (e.clientX - rect.left) / width;
      mouse.y = (e.clientY - rect.top) / height;

      const dx = mouse.x - mouse.prevX;
      const dy = mouse.y - mouse.prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (mouse.down) {
        for (let i = 0; i < 5; i++) {
          particles.push({
            x: mouse.x * width,
            y: mouse.y * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1,
            life: 100,
            size: 20 + Math.random() * 30,
            hue: 280 + Math.random() * 40,
          });
        }
      } else {
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: mouse.x * width,
            y: mouse.y * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.3,
            life: 80,
            size: 10 + Math.random() * 15,
            hue: 200 + Math.random() * 60,
          });
        }
      }
    };

    const handleMouseDown = () => { mouse.down = true; };
    const handleMouseUp = () => { mouse.down = false; };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    handleResize();

    const render = () => {
      ctx.fillStyle = 'rgba(8, 5, 16, 0.08)';
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02;
        p.vx *= 0.98;
        p.life--;
        p.size += 0.5;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = (p.life / 100) * 0.4;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${alpha})`);
        grad.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);
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
    <div className="relative w-full h-full overflow-hidden bg-[#08050f]">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
      <div className="absolute bottom-4 left-4 text-xs font-mono text-white/40">
        CLICK & DRAG TO RELEASE SMOKE
      </div>
    </div>
  );
}
