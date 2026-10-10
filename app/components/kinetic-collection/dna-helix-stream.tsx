'use client';

import React, { useEffect, useRef } from 'react';

export default function DNAHelixStream() {
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

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = () => {
      time += 0.012;
      ctx.fillStyle = '#02030a';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const helixHeight = height;
      const radius = 140;
      const points = 80;

      // Strand 1
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const y = t * helixHeight;
        const angle = t * Math.PI * 8 - time * 1.5;
        const x = cx + Math.cos(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Strand 2
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const y = t * helixHeight;
        const angle = t * Math.PI * 8 - time * 1.5 + Math.PI;
        const x = cx + Math.cos(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Connecting bars
      for (let i = 0; i < points; i += 2) {
        const t = i / points;
        const y = t * helixHeight;
        const angle = t * Math.PI * 8 - time * 1.5;
        const x1 = cx + Math.cos(angle) * radius;
        const x2 = cx + Math.cos(angle + Math.PI) * radius;

        const alpha = 0.4 + Math.sin(t * Math.PI) * 0.4;
        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Nucleotide nodes
        const hue = (t * 360 + time * 30) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x1, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${(hue + 180) % 360}, 80%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x2, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
