'use client';

import React, { useEffect, useRef } from 'react';

export default function AudioWaveSculptor() {
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
    const bars = 64;

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
      time += 0.02;
      ctx.fillStyle = 'rgba(10, 10, 16, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const phase = (i / bars) * Math.PI * 4;
        const h1 = Math.abs(Math.sin(time + phase) * 80 + Math.cos(time * 0.7 + phase * 1.3) * 50);
        const h2 = Math.abs(Math.sin(time * 1.3 + phase * 0.5) * 40 + Math.sin(time * 2 + phase) * 30);
        const h = h1 + h2;
        const x = i * barWidth;

        const grad = ctx.createLinearGradient(0, height / 2 - h, 0, height / 2 + h);
        const hue = (i / bars) * 200 + 200;
        grad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0)`);
        grad.addColorStop(0.5, `hsla(${hue}, 80%, 60%, 0.9)`);
        grad.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
        ctx.fillStyle = grad;

        ctx.fillRect(x + 2, height / 2 - h, barWidth - 4, h * 2);

        // Mirror
        const mirrorGrad = ctx.createLinearGradient(0, height / 2 - h * 0.4, 0, height / 2 + h * 0.4);
        mirrorGrad.addColorStop(0, `hsla(${hue + 60}, 70%, 50%, 0)`);
        mirrorGrad.addColorStop(0.5, `hsla(${hue + 60}, 70%, 50%, 0.5)`);
        mirrorGrad.addColorStop(1, `hsla(${hue + 60}, 70%, 50%, 0)`);
        ctx.fillStyle = mirrorGrad;
        ctx.fillRect(x + 2, height / 2 - h * 0.4, barWidth - 4, h * 0.8);
      }

      // Center line
      ctx.strokeStyle = 'rgba(120, 200, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

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
