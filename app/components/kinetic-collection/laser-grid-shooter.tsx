'use client';

import React, { useEffect, useRef } from 'react';

export default function LaserGridShooter() {
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

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', () => { mouse.down = true; });
    canvas.addEventListener('mouseup', () => { mouse.down = false; });
    handleResize();

    const render = () => {
      time += 0.015;
      ctx.fillStyle = 'rgba(8, 2, 16, 0.18)';
      ctx.fillRect(0, 0, width, height);

      // Grid floor with perspective
      const horizonY = height * 0.4;
      const fov = 500;
      const lines = 20;

      ctx.strokeStyle = 'rgba(255, 50, 100, 0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < lines; i++) {
        const z = ((i * 50 + time * 100) % 1000);
        const scale = fov / (z + 100);
        const y = horizonY + z * scale * 0.1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      ctx.strokeStyle = 'rgba(100, 50, 255, 0.4)';
      for (let i = -10; i <= 10; i++) {
        const x = width / 2 + i * 50;
        ctx.beginPath();
        ctx.moveTo(width / 2 + i * 100, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Sun
      const sunY = horizonY;
      ctx.beginPath();
      ctx.arc(width / 2, sunY, 80, 0, Math.PI * 2);
      const sunGrad = ctx.createLinearGradient(0, sunY - 80, 0, sunY + 80);
      sunGrad.addColorStop(0, '#ffeb3b');
      sunGrad.addColorStop(0.5, '#ff5722');
      sunGrad.addColorStop(1, '#e91e63');
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Laser beam from cursor
      if (mouse.down) {
        const lx = mouse.x * width;
        const ly = mouse.y * height;
        const grad = ctx.createLinearGradient(width / 2, sunY, lx, ly);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(1, 'rgba(255, 100, 200, 0.7)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(width / 2, sunY);
        ctx.lineTo(lx, ly);
        ctx.stroke();
        ctx.shadowBlur = 0;
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
    <div className="relative w-full h-full overflow-hidden bg-[#080210]">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
      <div className="absolute bottom-4 left-4 text-xs font-mono text-pink-300/60">
        HOLD MOUSE TO FIRE LASER
      </div>
    </div>
  );
}
