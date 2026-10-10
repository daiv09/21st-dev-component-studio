'use client';

import React, { useEffect, useRef } from 'react';

export default function AuroraWaves() {
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
      time += 0.006;
      ctx.fillStyle = 'rgba(1, 2, 10, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (let i = 0; i < 100; i++) {
        const x = (i * 73.5) % width;
        const y = (i * 47.3) % (height * 0.6);
        const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
        ctx.fillRect(x, y, 1, 1);
      }

      // Aurora layers
      const layers = [
        { hue: 120, alpha: 0.3, amp: 80, yOff: 0.3 },
        { hue: 160, alpha: 0.4, amp: 100, yOff: 0.4 },
        { hue: 200, alpha: 0.3, amp: 90, yOff: 0.5 },
        { hue: 280, alpha: 0.3, amp: 110, yOff: 0.45 },
      ];

      for (const layer of layers) {
        const baseY = height * layer.yOff + (mouse.y - 0.5) * 50;
        const points = 50;

        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const x = t * width;
          const wave = (
            Math.sin(t * 6 + time + layer.hue * 0.01) * 0.5 +
            Math.cos(t * 10 - time * 0.7) * 0.3 +
            Math.sin(t * 16 + time * 1.3) * 0.2
          ) * layer.amp;
          const y = baseY + wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        for (let i = points; i >= 0; i--) {
          const t = i / points;
          const x = t * width;
          const wave = (
            Math.sin(t * 6 + time + layer.hue * 0.01) * 0.5 +
            Math.cos(t * 10 - time * 0.7) * 0.3
          ) * layer.amp;
          const y = baseY + wave + 60;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseY - layer.amp, 0, baseY + layer.amp);
        grad.addColorStop(0, `hsla(${layer.hue}, 80%, 60%, 0)`);
        grad.addColorStop(0.5, `hsla(${layer.hue}, 80%, 60%, ${layer.alpha})`);
        grad.addColorStop(1, `hsla(${layer.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = grad;
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
    <div className="relative w-full h-full overflow-hidden bg-[#010210]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
