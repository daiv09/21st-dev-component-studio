'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

export default function WarpDriveStars() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const stars: Star[] = [];
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

      stars.length = 0;
      for (let i = 0; i < 600; i++) {
        stars.push({
          x: (Math.random() - 0.5) * width,
          y: (Math.random() - 0.5) * height,
          z: Math.random() * width,
          pz: 0,
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
      ctx.fillStyle = 'rgba(0, 0, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 100;
      const cy = height / 2 + (mouse.y - 0.5) * 100;
      const speed = 8;

      for (const star of stars) {
        star.pz = star.z;
        star.z -= speed;
        if (star.z < 1) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
          star.pz = star.z;
        }

        const sx = (star.x / star.z) * width + cx - width / 2;
        const sy = (star.y / star.z) * height + cy - height / 2;
        const psx = (star.x / star.pz) * width + cx - width / 2;
        const psy = (star.y / star.pz) * height + cy - height / 2;

        const size = (1 - star.z / width) * 3;
        const opacity = 1 - star.z / width;

        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(psx, psy);
        ctx.stroke();
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
