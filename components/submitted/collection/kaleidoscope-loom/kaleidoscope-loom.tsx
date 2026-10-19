"use client";

import React, { useEffect, useRef } from "react";

interface Stroke {
  x: number;
  y: number;
  px: number;
  py: number;
  hue: number;
  w: number;
  life: number;
}

export interface KaleidoscopeLoomProps {
  title?: string;
  description?: string;
  className?: string;
}

export function KaleidoscopeLoom({
  title = "LOOM",
  description = "Dihedral silk. Paint with the cursor. Click to change fold count. Double-click to clear.",
  className = "",
}: KaleidoscopeLoomProps) {
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
    let hue = 280;
    let folds = 8;
    let idleT = 0;
    let lastMove = 0;
    const strokes: Stroke[] = [];
    const mouse = { x: 0, y: 0, px: 0, py: 0, inside: false };

    const clear = () => {
      ctx.fillStyle = "#04020a";
      ctx.fillRect(0, 0, width, height);
      strokes.length = 0;
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
      clear();
    };

    const pushStroke = (x: number, y: number, px: number, py: number, speed: number) => {
      hue = (hue + speed * 0.35 + 0.4) % 360;
      const steps = Math.min(10, 1 + Math.floor(speed / 5));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const nx = px + (x - px) * t;
        const ny = py + (y - py) * t;
        const ox = px + (x - px) * Math.max(0, t - 1 / steps);
        const oy = py + (y - py) * Math.max(0, t - 1 / steps);
        strokes.push({
          x: nx,
          y: ny,
          px: ox,
          py: oy,
          hue,
          w: 1.4 + speed * 0.055,
          life: 1,
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.clientX - rect.left - width / 2;
      mouse.y = e.clientY - rect.top - height / 2;
      mouse.inside = true;
      lastMove = performance.now();
      const speed = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
      pushStroke(mouse.x, mouse.y, mouse.px, mouse.py, speed);
    };
    const onLeave = () => {
      mouse.inside = false;
    };
    const onDown = (e: PointerEvent) => {
      if (e.detail >= 2) {
        clear();
        return;
      }
      folds = folds === 6 ? 8 : folds === 8 ? 12 : 6;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("pointerdown", onDown);

    const drawStroke = (s: Stroke) => {
      ctx.strokeStyle = `hsla(${s.hue}, 95%, 68%, ${s.life * 0.9})`;
      ctx.lineWidth = s.w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.strokeStyle = `hsla(${(s.hue + 50) % 360}, 95%, 76%, ${s.life * 0.28})`;
      ctx.lineWidth = s.w * 4.2;
      ctx.stroke();
    };

    const tick = (now: number) => {
      ctx.fillStyle = "rgba(4,2,10,0.045)";
      ctx.fillRect(0, 0, width, height);

      if (!mouse.inside && now - lastMove > 800) {
        idleT += 0.018;
        const r = Math.min(width, height) * 0.22;
        const x = Math.cos(idleT * 1.3) * r + Math.cos(idleT * 0.7) * r * 0.4;
        const y = Math.sin(idleT * 1.1) * r * 0.7;
        const px = Math.cos((idleT - 0.018) * 1.3) * r + Math.cos((idleT - 0.018) * 0.7) * r * 0.4;
        const py = Math.sin((idleT - 0.018) * 1.1) * r * 0.7;
        pushStroke(x, y, px, py, 8);
      }

      const cx = width / 2;
      const cy = height / 2;

      // faint fold guides
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 1;
      for (let f = 0; f < folds; f++) {
        const a = (f / folds) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * Math.hypot(width, height), Math.sin(a) * Math.hypot(width, height));
        ctx.stroke();
      }

      for (let i = strokes.length - 1; i >= 0; i--) {
        const s = strokes[i];
        s.life -= 0.006;
        if (s.life <= 0) {
          strokes.splice(i, 1);
          continue;
        }
        for (let f = 0; f < folds; f++) {
          ctx.save();
          ctx.rotate((f / folds) * Math.PI * 2);
          drawStroke(s);
          ctx.scale(1, -1);
          drawStroke(s);
          ctx.restore();
        }
      }
      ctx.restore();

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden select-none bg-[#04020a] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-4 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
          {title}
        </h1>
        <p className="mt-3 max-w-lg font-mono text-xs opacity-70 md:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default KaleidoscopeLoom;
