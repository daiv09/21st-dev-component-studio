'use client';

import React, { useEffect, useRef } from 'react';

export default function QuantumFoam() {
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
      time += 0.008;
      ctx.fillStyle = 'rgba(2, 0, 12, 0.03)';
      ctx.fillRect(0, 0, width, height);

      // Quantum foam bubbles
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 + time * 0.2;
        const radius = (100 + i * 5) + Math.sin(time + i) * 30;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        const size = Math.abs(5 + Math.sin(time * 2 + i) * 8);

        const dx = x / width - mouse.x;
        const dy = y / height - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const intensity = Math.max(0, 1 - dist * 2);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${200 + i * 3}, 80%, 60%, ${0.5 + intensity * 0.4})`;
        ctx.fill();

        ctx.strokeStyle = `hsla(${200 + i * 3 + 30}, 80%, 70%, ${0.4 + intensity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        grad.addColorStop(0, `hsla(${200 + i * 3}, 80%, 80%, ${0.8})`);
        grad.addColorStop(1, `hsla(${200 + i * 3}, 80%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#02000c]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
