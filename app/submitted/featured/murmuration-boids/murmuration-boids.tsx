"use client";

import React, { useEffect, useRef } from "react";

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface MurmurationBoidsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function MurmurationBoids({
  title = "FLOCK",
  description = "A starling engine. Alignment, cohesion, separation — then the cursor as a hawk.",
  className = "",
}: MurmurationBoidsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const mouse = { x: -9999, y: -9999 };
    let birds: Bird[] = [];

    const spawn = () => {
      birds = [];
      const n = Math.min(220, Math.floor((width * height) / 5500));
      for (let i = 0; i < n; i++) {
        birds.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawn();
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    const tick = () => {
      ctx.fillStyle = "#140e14";
      ctx.fillRect(0, 0, width, height);

      const visual = 70;
      const vis2 = visual * visual;
      const maxSpeed = 3.4;
      const maxForce = 0.08;

      for (let i = 0; i < birds.length; i++) {
        const b = birds[i];
        let ax = 0;
        let ay = 0;
        let cx = 0;
        let cy = 0;
        let sx = 0;
        let sy = 0;
        let n = 0;

        for (let j = 0; j < birds.length; j++) {
          if (i === j) continue;
          const o = birds[j];
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > vis2 || d2 === 0) continue;
          n++;
          ax += o.vx;
          ay += o.vy;
          cx += o.x;
          cy += o.y;
          const d = Math.sqrt(d2);
          if (d < 22) {
            sx -= dx / d;
            sy -= dy / d;
          }
        }

        if (n > 0) {
          ax = ax / n - b.vx;
          ay = ay / n - b.vy;
          cx = cx / n - b.x;
          cy = cy / n - b.y;
        }

        const mdx = b.x - mouse.x;
        const mdy = b.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;
        let fx = 0;
        let fy = 0;
        if (md2 < 180 * 180 && md2 > 0) {
          const md = Math.sqrt(md2);
          const flee = (1 - md / 180) * 2.4;
          fx = (mdx / md) * flee;
          fy = (mdy / md) * flee;
        }

        b.vx += ax * 0.04 + cx * 0.002 + sx * 0.12 + fx;
        b.vy += ay * 0.04 + cy * 0.002 + sy * 0.12 + fy;

        const sp = Math.hypot(b.vx, b.vy) || 1;
        if (sp > maxSpeed) {
          b.vx = (b.vx / sp) * maxSpeed;
          b.vy = (b.vy / sp) * maxSpeed;
        } else if (sp < 1.2) {
          b.vx = (b.vx / sp) * 1.2;
          b.vy = (b.vy / sp) * 1.2;
        }

        b.vx += (Math.min(maxForce, Math.max(-maxForce, (width * 0.5 - b.x) * 0.00008)));
        b.vy += (height * 0.5 - b.y) * 0.00008;

        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -10) b.x = width + 10;
        if (b.x > width + 10) b.x = -10;
        if (b.y < -10) b.y = height + 10;
        if (b.y > height + 10) b.y = -10;
      }

      ctx.fillStyle = "#f3e6d4";
      for (let i = 0; i < birds.length; i++) {
        const b = birds[i];
        const a = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-5, 3.2);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-5, -3.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden select-none bg-[#140e14] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-none" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-4 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-6xl font-black uppercase leading-none tracking-tighter md:text-9xl">
          {title}
        </h1>
        <p className="mt-4 max-w-lg font-mono text-xs opacity-70 md:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default MurmurationBoids;
