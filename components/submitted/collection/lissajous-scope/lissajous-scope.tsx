"use client";

import React, { useEffect, useRef } from "react";

export interface LissajousScopeProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LissajousScope({
  title = "SCOPE",
  description = "Phosphor persistence. X-frequency and phase ride the cursor. A / B locks to integer ratios.",
  className = "",
}: LissajousScopeProps) {
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
    let t = 0;
    const mouse = { x: 0.35, y: 0.5, tx: 0.35, ty: 0.5 };

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
      ctx.fillStyle = "#070b06";
      ctx.fillRect(0, 0, width, height);
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / width;
      mouse.ty = (e.clientY - rect.top) / height;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);

    const tick = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      ctx.fillStyle = "rgba(7,11,6,0.08)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const amp = Math.min(width, height) * 0.32;
      const a = 1 + Math.round(mouse.x * 6);
      const b = 1 + Math.round(mouse.y * 5);
      const delta = mouse.x * Math.PI;

      ctx.beginPath();
      const steps = 900;
      for (let i = 0; i <= steps; i++) {
        const u = (i / steps) * Math.PI * 2 * 2 + t;
        const x = cx + Math.sin(a * u + delta) * amp;
        const y = cy + Math.sin(b * u) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(80,255,90,0.18)";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = "rgba(180,255,160,0.95)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const bx = cx + Math.sin(a * t + delta) * amp;
      const by = cy + Math.sin(b * t) * amp;
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, 18);
      g.addColorStop(0, "rgba(220,255,210,0.9)");
      g.addColorStop(1, "rgba(80,255,90,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "11px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.fillStyle = "rgba(120,200,110,0.7)";
      ctx.fillText(`A:${a}  B:${b}  δ:${delta.toFixed(2)}`, 24, height - 28);

      t += 0.018;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden select-none bg-[#070b06] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.65)]" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start px-4 pt-16 text-center text-[#9dff9a]">
        <h1 className="font-mono text-5xl font-black uppercase leading-none tracking-tighter md:text-8xl">
          {title}
        </h1>
        <p className="mt-4 max-w-lg font-mono text-xs opacity-70 md:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default LissajousScope;
