'use client';

import React, { useEffect, useRef } from 'react';

export default function IsometricCubeMarch() {
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
      time += 0.01;
      ctx.fillStyle = '#0a0612';
      ctx.fillRect(0, 0, width, height);

      const cubeSize = 50;
      const cols = 8;
      const rows = 8;
      const offsetX = (width - cols * cubeSize) / 2;
      const offsetY = (height - rows * cubeSize * 0.5) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * cubeSize;
          const baseY = r * cubeSize * 0.5;
          const isoX = (baseX - baseY) + offsetX + width / 2;
          const isoY = (baseX + baseY) * 0.5 + offsetY;

          const dx = c / cols - mouse.x;
          const dy = r / rows - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const wave = Math.sin(dist * 5 - time * 2) * 0.5 + 0.5;
          const height3D = wave * cubeSize * 1.5;

          const hue = 200 + dist * 80 + time * 20;

          // Top face
          ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
          ctx.beginPath();
          ctx.moveTo(isoX, isoY - height3D);
          ctx.lineTo(isoX + cubeSize / 2, isoY + cubeSize / 4 - height3D);
          ctx.lineTo(isoX, isoY + cubeSize / 2 - height3D);
          ctx.lineTo(isoX - cubeSize / 2, isoY + cubeSize / 4 - height3D);
          ctx.closePath();
          ctx.fill();

          // Right face
          ctx.fillStyle = `hsl(${hue}, 70%, 40%)`;
          ctx.beginPath();
          ctx.moveTo(isoX + cubeSize / 2, isoY + cubeSize / 4 - height3D);
          ctx.lineTo(isoX + cubeSize / 2, isoY + cubeSize / 4);
          ctx.lineTo(isoX, isoY + cubeSize / 2);
          ctx.lineTo(isoX, isoY + cubeSize / 2 - height3D);
          ctx.closePath();
          ctx.fill();

          // Left face
          ctx.fillStyle = `hsl(${hue}, 70%, 30%)`;
          ctx.beginPath();
          ctx.moveTo(isoX - cubeSize / 2, isoY + cubeSize / 4 - height3D);
          ctx.lineTo(isoX - cubeSize / 2, isoY + cubeSize / 4);
          ctx.lineTo(isoX, isoY + cubeSize / 2);
          ctx.lineTo(isoX, isoY + cubeSize / 2 - height3D);
          ctx.closePath();
          ctx.fill();

          // Outline
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(isoX, isoY - height3D);
          ctx.lineTo(isoX + cubeSize / 2, isoY + cubeSize / 4 - height3D);
          ctx.lineTo(isoX + cubeSize / 2, isoY + cubeSize / 4);
          ctx.lineTo(isoX, isoY + cubeSize / 2);
          ctx.lineTo(isoX - cubeSize / 2, isoY + cubeSize / 4);
          ctx.lineTo(isoX - cubeSize / 2, isoY + cubeSize / 4 - height3D);
          ctx.closePath();
          ctx.stroke();
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
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
