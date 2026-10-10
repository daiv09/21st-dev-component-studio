'use client';

import React, { useEffect, useRef } from 'react';

export default function NeonGridPerspective() {
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.5 + (mouse.y - 0.5) * 100;
      const fov = 300;
      const lines = 30;
      const cols = 20;

      // Horizontal lines
      for (let i = 0; i < lines; i++) {
        const z = ((i * 40 + time * 60) % (lines * 40)) + 1;
        const scale = fov / z;
        const y = horizonY + z * scale * 0.15;
        const alpha = Math.max(0, 1 - z / (lines * 40));
        const hue = 280 + i * 3;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical lines
      for (let i = -cols; i <= cols; i++) {
        const x = width / 2 + i * 60;
        ctx.strokeStyle = `rgba(180, 100, 255, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2 + (mouse.x - 0.5) * 100, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Sun
      const sunY = horizonY - 30;
      const sunGrad = ctx.createLinearGradient(0, sunY - 100, 0, sunY + 100);
      sunGrad.addColorStop(0, '#ff006e');
      sunGrad.addColorStop(0.5, '#ff7e00');
      sunGrad.addColorStop(1, '#ffb800');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width / 2, sunY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Grid lines on sun
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      for (let i = 0; i < 5; i++) {
        const lineY = sunY - 60 + i * 30;
        const dy = Math.abs(lineY - sunY);
        if (dy < 80) {
          const width2 = Math.sqrt(80 * 80 - dy * dy) * 2;
          ctx.fillRect(width / 2 - width2, lineY, width2 * 2, 4);
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
