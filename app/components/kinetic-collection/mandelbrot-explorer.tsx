'use client';

import React, { useEffect, useRef } from 'react';

export default function MandelbrotExplorer() {
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
      time += 0.005;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      const zoom = 1 + Math.sin(time) * 0.3;
      const offsetX = (mouse.x - 0.5) * 2;
      const offsetY = (mouse.y - 0.5) * 2;

      for (let py = 0; py < height; py += 2) {
        for (let px = 0; px < width; px += 2) {
          const x0 = (px / width * 3.5 - 2.5) / zoom + offsetX;
          const y0 = (py / height * 2 - 1) / zoom + offsetY;

          let x = 0, y = 0;
          let iter = 0;
          const maxIter = 30;

          while (x * x + y * y < 4 && iter < maxIter) {
            const xtemp = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = xtemp;
            iter++;
          }

          const hue = iter * 12;
          const lightness = iter === maxIter ? 0 : 30 + iter * 2;

          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              const idx = ((py + dy) * width + (px + dx)) * 4;
              if (iter === maxIter) {
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
              } else {
                data[idx] = lightness * 1.5;
                data[idx + 1] = lightness;
                data[idx + 2] = lightness * 2;
              }
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
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
