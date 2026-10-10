"use client";

import React, { useEffect, useRef } from "react";

export interface TesseractProjectorProps {
  title?: string;
  description?: string;
  className?: string;
}

function rotate4(v: number[], plane: [number, number], a: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const out = v.slice();
  const i = plane[0];
  const j = plane[1];
  out[i] = v[i] * c - v[j] * s;
  out[j] = v[i] * s + v[j] * c;
  return out;
}

export function TesseractProjector({
  title = "TESSERACT",
  description = "A 4-cube folding through 3-space. Cursor XY shears the W-planes.",
  className = "",
}: TesseractProjectorProps) {
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
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const verts4: number[][] = [];
    for (let i = 0; i < 16; i++) {
      verts4.push([
        i & 1 ? 1 : -1,
        i & 2 ? 1 : -1,
        i & 4 ? 1 : -1,
        i & 8 ? 1 : -1,
      ]);
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) if (verts4[i][k] !== verts4[j][k]) diff++;
        if (diff === 1) edges.push([i, j]);
      }
    }

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
      mouse.tx = (e.clientX - rect.left) / width - 0.5;
      mouse.ty = (e.clientY - rect.top) / height - 0.5;
    };
    const onLeave = () => {
      mouse.tx = 0;
      mouse.ty = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    const tick = () => {
      time += 0.012;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      ctx.fillStyle = "#0b0d12";
      ctx.fillRect(0, 0, width, height);

      const aXY = time * 0.4;
      const aXZ = time * 0.18;
      const aXW = time * 0.55 + mouse.x * 1.8;
      const aYW = time * 0.32 + mouse.y * 1.8;
      const aZW = time * 0.22;

      const projected: { x: number; y: number; z: number; w: number }[] = [];
      const scale = Math.min(width, height) * 0.22;

      for (let i = 0; i < 16; i++) {
        let v = verts4[i];
        v = rotate4(v, [0, 1], aXY);
        v = rotate4(v, [0, 2], aXZ);
        v = rotate4(v, [0, 3], aXW);
        v = rotate4(v, [1, 3], aYW);
        v = rotate4(v, [2, 3], aZW);
        const dist = 3.2;
        const w = 1 / (dist - v[3]);
        projected.push({
          x: width / 2 + v[0] * w * scale * 2.2,
          y: height / 2 + v[1] * w * scale * 2.2,
          z: v[2] * w,
          w: v[3],
        });
      }

      for (const [i, j] of edges) {
        const a = projected[i];
        const b = projected[j];
        const depth = (a.z + b.z) * 0.5;
        const t = (depth + 1) * 0.5;
        const inner = Math.abs(a.w) + Math.abs(b.w) > 2.2;
        ctx.strokeStyle = inner
          ? `rgba(120, 230, 255, ${0.25 + t * 0.5})`
          : `rgba(240, 248, 255, ${0.35 + t * 0.5})`;
        ctx.lineWidth = 1.2 + t * 1.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const p of projected) {
        const r = 3 + (p.z + 1) * 2;
        ctx.fillStyle = p.w > 0 ? "#9ef6ff" : "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
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
      className={`relative h-screen w-full overflow-hidden select-none bg-[#0b0d12] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-move" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start px-4 pt-16 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-5xl font-black uppercase leading-none tracking-tighter md:text-8xl">
          {title}
        </h1>
        <p className="mt-4 max-w-lg font-mono text-xs opacity-70 md:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default TesseractProjector;
