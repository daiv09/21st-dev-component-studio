'use client';

import React, { useEffect, useRef } from 'react';

export default function PerlinNoiseTerrain() {
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

    // Simple noise
    const noise = (x: number, y: number) => {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    const smoothNoise = (x: number, y: number) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      const a = noise(ix, iy);
      const b = noise(ix + 1, iy);
      const c = noise(ix, iy + 1);
      const d = noise(ix + 1, iy + 1);
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    };

    const fbm = (x: number, y: number) => {
      let v = 0;
      let a = 0.5;
      for (let i = 0; i < 5; i++) {
        v += a * smoothNoise(x, y);
        x *= 2;
        y *= 2;
        a *= 0.5;
      }
      return v;
    };

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
      time += 0.003;
      ctx.fillStyle = '#03050f';
      ctx.fillRect(0, 0, width, height);

      const scale = 0.005;
      const cellSize = 4;

      for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
          const n = fbm(x * scale + time, y * scale + time * 0.5);
          const value = Math.pow(n, 1.5);
          const hue = 180 + value * 100;
          const lightness = 20 + value * 50;
          const alpha = 0.4 + value * 0.5;
          ctx.fillStyle = `hsla(${hue}, 70%, ${lightness}%, ${alpha})`;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
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
