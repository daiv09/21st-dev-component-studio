'use client';

import React, { useEffect, useRef } from 'react';

export default function TopologyMorph() {
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
      ctx.fillStyle = 'rgba(2, 4, 16, 0.08)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const morphType = Math.floor(time / 4) % 3;
      const localTime = time % 4;

      // Klein bottle / torus / sphere morph
      const points = 80;
      const slices = 40;

      for (let i = 0; i < slices; i += 2) {
        const t = i / slices;
        ctx.beginPath();
        for (let j = 0; j <= points; j++) {
          const u = (j / points) * Math.PI * 2;
          let x = 0, y = 0, z = 0;

          if (morphType === 0) {
            // Torus
            const R = 150, r = 60;
            x = (R + r * Math.cos(u)) * Math.cos(t * Math.PI * 2);
            y = (R + r * Math.cos(u)) * Math.sin(t * Math.PI * 2);
            z = r * Math.sin(u);
          } else if (morphType === 1) {
            // Klein bottle
            const v = t * Math.PI * 2;
            const a = 2;
            x = (a + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.cos(v) * 30;
            y = (a + Math.cos(v / 2) * Math.sin(u) - Math.sin(v / 2) * Math.sin(2 * u)) * Math.sin(v) * 30;
            z = Math.sin(v / 2) * Math.sin(u) + Math.cos(v / 2) * Math.sin(2 * u) * 30;
          } else {
            // Sphere
            const r = 150;
            x = r * Math.sin(t * Math.PI) * Math.cos(u);
            y = r * Math.cos(t * Math.PI);
            z = r * Math.sin(t * Math.PI) * Math.sin(u);
          }

          // Rotate around Y
          const rotY = time * 0.3;
          const rotX = (mouse.y - 0.5) * Math.PI;
          const xR = x * Math.cos(rotY) - z * Math.sin(rotY);
          const zR = x * Math.sin(rotY) + z * Math.cos(rotY);
          const yR = y * Math.cos(rotX) - zR * Math.sin(rotX);
          const zFinal = y * Math.sin(rotX) + zR * Math.cos(rotX);

          const scale = 200 / (200 + zFinal);
          const screenX = cx + xR * scale;
          const screenY = cy + yR * scale;

          if (j === 0) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }

        const hue = 200 + i * 5 + localTime * 50;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.5 + (1 - t) * 0.3})`;
        ctx.lineWidth = 1;
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
    <div className="relative w-full h-full overflow-hidden bg-[#020410]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
