'use client';

import React, { useEffect, useRef } from 'react';

export default function CellularMitosis() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const cells: { x: number; y: number; vx: number; vy: number; radius: number; hue: number; splits: number }[] = [];
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

      cells.length = 0;
      for (let i = 0; i < 8; i++) {
        cells.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 30 + Math.random() * 30,
          hue: 120 + i * 30,
          splits: 0,
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
      ctx.fillStyle = 'rgba(0, 4, 8, 0.04)';
      ctx.fillRect(0, 0, width, height);

      // Update cells
      for (let i = cells.length - 1; i >= 0; i--) {
        const c = cells[i];
        c.x += c.vx;
        c.y += c.vy;
        if (c.x < c.radius || c.x > width - c.radius) c.vx *= -1;
        if (c.y < c.radius || c.y > height - c.radius) c.vy *= -1;

        // Mitotic split if too large
        if (c.radius > 60) {
          cells.push({
            x: c.x, y: c.y,
            vx: -c.vx + (Math.random() - 0.5) * 0.5,
            vy: -c.vy + (Math.random() - 0.5) * 0.5,
            radius: c.radius / 1.4,
            hue: c.hue,
            splits: c.splits + 1,
          });
          c.radius = c.radius / 1.4;
          c.vx *= -1;
          c.vy *= -1;
        }

        // Grow near mouse
        const dx = c.x - mouse.x * width;
        const dy = c.y - mouse.y * height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          c.radius += 0.1;
        } else {
          c.radius *= 0.998;
        }
      }

      // Draw cells
      for (const c of cells) {
        // Outer membrane
        const outerGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
        outerGrad.addColorStop(0, `hsla(${c.hue}, 70%, 70%, 0.6)`);
        outerGrad.addColorStop(0.7, `hsla(${c.hue}, 70%, 50%, 0.4)`);
        outerGrad.addColorStop(1, `hsla(${c.hue}, 70%, 40%, 0)`);
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        // Nucleus
        const nucleusGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius * 0.3);
        nucleusGrad.addColorStop(0, `hsla(${c.hue + 20}, 80%, 60%, 0.9)`);
        nucleusGrad.addColorStop(1, `hsla(${c.hue + 20}, 80%, 50%, 0)`);
        ctx.fillStyle = nucleusGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Membrane line
        ctx.strokeStyle = `hsla(${c.hue}, 80%, 70%, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
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
    <div className="relative w-full h-full overflow-hidden bg-[#000408]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
