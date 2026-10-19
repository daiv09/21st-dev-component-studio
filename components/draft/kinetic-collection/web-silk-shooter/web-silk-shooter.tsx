'use client';

import React, { useEffect, useRef } from 'react';

export default function WebSilkShooter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const threads: { points: { x: number; y: number }[]; life: number; maxLife: number }[] = [];
    const mouse = { x: 0, y: 0, prevX: 0, prevY: 0, down: false };

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
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      if (mouse.down) {
        const dist = Math.sqrt((mouse.x - mouse.prevX) ** 2 + (mouse.y - mouse.prevY) ** 2);
        if (dist > 5) {
          threads.push({
            points: [
              { x: mouse.prevX, y: mouse.prevY },
              { x: mouse.x, y: mouse.y },
            ],
            life: 100,
            maxLife: 100,
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
      ctx.fillStyle = 'rgba(8, 5, 16, 0.06)';
      ctx.fillRect(0, 0, width, height);

      for (let i = threads.length - 1; i >= 0; i--) {
        const thread = threads[i];
        thread.life -= 0.3;
        if (thread.life <= 0) {
          threads.splice(i, 1);
          continue;
        }

        // Add web effect
        if (Math.random() > 0.7 && thread.points.length < 20) {
          const last = thread.points[thread.points.length - 1];
          const next = {
            x: last.x + (Math.random() - 0.5) * 20,
            y: last.y + (Math.random() - 0.5) * 20,
          };
          thread.points.push(next);

          // Add radial web lines
          for (let j = 0; j < 3; j++) {
            const angle = Math.random() * Math.PI * 2;
            const length = 10 + Math.random() * 15;
            const endX = next.x + Math.cos(angle) * length;
            const endY = next.y + Math.sin(angle) * length;
            thread.points.push({ x: endX, y: endY });
            thread.points.push({ x: next.x, y: next.y });
          }
        }

        const alpha = thread.life / thread.maxLife;
        ctx.beginPath();
        ctx.moveTo(thread.points[0].x, thread.points[0].y);
        for (let j = 1; j < thread.points.length; j++) {
          ctx.lineTo(thread.points[j].x, thread.points[j].y);
        }
        ctx.strokeStyle = `rgba(220, 220, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
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
    <div className="relative w-full h-full overflow-hidden bg-[#080510]">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
      <div className="absolute bottom-4 left-4 text-xs font-mono text-cyan-200/60">
        DRAG TO WEAVE SPIDER SILK
      </div>
    </div>
  );
}
