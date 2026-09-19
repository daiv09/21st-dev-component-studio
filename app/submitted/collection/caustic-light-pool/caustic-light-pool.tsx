"use client";

import React, { useEffect, useRef } from "react";

export interface CausticLightPoolProps {
  title?: string;
  description?: string;
  className?: string;
}

export function CausticLightPool({
  title = "CAUSTIC",
  description = "Refracted sun on the pool floor. Move the light. Constructive interference becomes fire.",
  className = "",
}: CausticLightPoolProps) {
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
    const mouse = { x: 0.5, y: 0.35, tx: 0.5, ty: 0.35 };
    const cell = 10;

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
      time += 0.016;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      ctx.fillStyle = "#021018";
      ctx.fillRect(0, 0, width, height);

      const lx = mouse.x * width;
      const ly = mouse.y * height;
      const cols = Math.ceil(width / cell) + 1;
      const rows = Math.ceil(height / cell) + 1;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cell;
          const y = j * cell;
          const nx = x * 0.012;
          const ny = y * 0.012;
          const w1 = Math.sin(nx + time * 1.1 + mouse.x * 4);
          const w2 = Math.sin(ny * 1.3 - time * 0.9 + mouse.y * 3);
          const w3 = Math.sin((nx + ny) * 0.85 + time * 0.7);
          const w4 = Math.sin(Math.hypot(x - lx, y - ly) * 0.018 - time * 1.6);
          let v = w1 + w2 + w3 + w4 * 1.4;
          v = v * v * 0.18;
          if (v < 0.08) continue;
          const a = Math.min(1, v);
          const r = 140 + a * 90;
          const g = 210 + a * 40;
          const b = 230;
          ctx.fillStyle = `rgba(${r | 0},${g | 0},${b},${a * 0.55})`;
          ctx.fillRect(x, y, cell + 0.5, cell + 0.5);
        }
      }

      const sun = ctx.createRadialGradient(lx, ly, 8, lx, ly, 280);
      sun.addColorStop(0, "rgba(255,244,210,0.28)");
      sun.addColorStop(0.4, "rgba(80,200,220,0.08)");
      sun.addColorStop(1, "rgba(2,16,24,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, width, height);

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
      className={`relative h-screen w-full overflow-hidden select-none bg-[#021018] ${className}`}
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

export default CausticLightPool;
