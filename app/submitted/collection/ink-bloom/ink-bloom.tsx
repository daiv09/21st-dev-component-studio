"use client";

import React, { useEffect, useRef } from "react";

interface Grain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  h: number;
  s: number;
  l: number;
}

const PIGMENTS = [
  { h: 352, s: 95, l: 58 },
  { h: 28, s: 100, l: 56 },
  { h: 48, s: 100, l: 54 },
  { h: 152, s: 85, l: 48 },
  { h: 188, s: 90, l: 52 },
  { h: 262, s: 85, l: 62 },
  { h: 318, s: 90, l: 60 },
];

export interface InkBloomProps {
  title?: string;
  description?: string;
  className?: string;
}

export function InkBloom({
  title = "SUMI",
  description = "Vivid pigment on wet paper. Hue follows the cursor. Click to bloom, hold to flood, double-click to rinse.",
  className = "",
}: InkBloomProps) {
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
    let time = 0;
    const mouse = { x: 0, y: 0, down: false };
    const grains: Grain[] = [];

    const paintPaper = () => {
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#fff7e8");
      g.addColorStop(0.5, "#ffe9d2");
      g.addColorStop(1, "#ffd6e8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.07;
      for (let i = 0; i < 180; i++) {
        ctx.fillStyle = `hsl(${20 + Math.random() * 40}, 40%, ${70 + Math.random() * 20}%)`;
        ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
      }
      ctx.globalAlpha = 1;
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
      paintPaper();
    };

    const pigmentAt = (x: number) => {
      const t = Math.max(0, Math.min(0.999, x / Math.max(1, width)));
      return PIGMENTS[Math.floor(t * PIGMENTS.length)];
    };

    const drop = (x: number, y: number, n = 80, pigment?: (typeof PIGMENTS)[number]) => {
      const p = pigment ?? pigmentAt(x);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 2.4;
        grains.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          max: 70 + Math.random() * 130,
          size: 1.6 + Math.random() * 5.2,
          h: p.h + (Math.random() - 0.5) * 18,
          s: p.s - Math.random() * 12,
          l: p.l + (Math.random() - 0.5) * 10,
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (mouse.down) drop(mouse.x, mouse.y, 22);
    };
    const onDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.down = true;
      drop(mouse.x, mouse.y, 110);
    };
    const onUp = () => {
      mouse.down = false;
    };
    const onDbl = () => {
      grains.length = 0;
      paintPaper();
    };

    resize();
    PIGMENTS.forEach((p, i) => {
      const x = width * (0.22 + (i / (PIGMENTS.length - 1)) * 0.56);
      const y = height * (0.42 + Math.sin(i * 1.3) * 0.12);
      drop(x, y, 180, p);
    });
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);
    container.addEventListener("dblclick", onDbl);
    window.addEventListener("pointerup", onUp);

    const tick = () => {
      time += 0.016;
      ctx.globalCompositeOperation = "multiply";
      for (let i = grains.length - 1; i >= 0; i--) {
        const g = grains[i];
        const n = Math.sin(g.x * 0.016 + time) * Math.cos(g.y * 0.014 - time * 0.7);
        g.vx += -Math.cos(g.y * 0.018 + time * 0.5) * 0.55 + n * 0.18;
        g.vy += Math.sin(g.x * 0.018 - time * 0.4) * 0.55 - n * 0.12;
        g.vx *= 0.982;
        g.vy *= 0.982;
        g.x += g.vx;
        g.y += g.vy;
        g.life -= 1 / g.max;
        const a = Math.max(0, g.life) * 0.2;
        ctx.fillStyle = `hsla(${g.h}, ${g.s}%, ${g.l}%, ${a})`;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.size * (0.5 + g.life), 0, Math.PI * 2);
        ctx.fill();
        if (g.life <= 0) grains.splice(i, 1);
      }
      ctx.globalCompositeOperation = "source-over";

      // hue cursor
      const p = pigmentAt(mouse.x || width * 0.5);
      ctx.strokeStyle = `hsla(${p.h}, ${p.s}%, ${p.l}%, 0.85)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mouse.x || -99, mouse.y || -99, 10, 0, Math.PI * 2);
      ctx.stroke();

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("dblclick", onDbl);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden select-none bg-[#fff7e8] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start px-4 pt-14 text-center">
        <h1 className="font-mono text-6xl font-black uppercase leading-none tracking-tighter text-[#1a1020] md:text-8xl">
          {title}
        </h1>
        <p className="mt-3 max-w-lg font-mono text-xs text-[#1a1020]/60 md:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default InkBloom;
