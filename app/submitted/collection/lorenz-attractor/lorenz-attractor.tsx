"use client";

import React, { useEffect, useRef } from "react";

export interface LorenzAttractorProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LorenzAttractor({
  title = "LORENZ",
  description = "A strange attractor in 3-space. Cursor XY retunes σ and ρ. The butterfly never lands twice.",
  className = "",
}: LorenzAttractorProps) {
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
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let p = { x: 0.1, y: 0, z: 0 };
    const trail: { x: number; y: number; z: number }[] = [];

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
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const sigma = 8 + mouse.x * 14;
      const rho = 20 + mouse.y * 18;
      const beta = 8 / 3;
      const dt = 0.008;
      for (let k = 0; k < 4; k++) {
        const dx = sigma * (p.y - p.x);
        const dy = p.x * (rho - p.z) - p.y;
        const dz = p.x * p.y - beta * p.z;
        p = { x: p.x + dx * dt, y: p.y + dy * dt, z: p.z + dz * dt };
        trail.push({ ...p });
        if (trail.length > 1400) trail.shift();
      }

      ctx.fillStyle = "#070b12";
      ctx.fillRect(0, 0, width, height);

      const yaw = (mouse.x - 0.5) * 1.2;
      const pitch = (mouse.y - 0.5) * 0.7;
      const cY = Math.cos(yaw);
      const sY = Math.sin(yaw);
      const cP = Math.cos(pitch);
      const sP = Math.sin(pitch);
      const scale = Math.min(width, height) * 0.018;

      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < trail.length; i++) {
        const q = trail[i];
        let x = q.x * cY + q.z * sY;
        let y = q.y;
        let z = -q.x * sY + q.z * cY;
        const y2 = y * cP - z * sP;
        const px = width * 0.5 + x * scale;
        const py = height * 0.52 + y2 * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#5eead4");
      g.addColorStop(0.5, "#38bdf8");
      g.addColorStop(1, "#f472b6");
      ctx.strokeStyle = g;
      ctx.stroke();

      if (trail.length) {
        const q = trail[trail.length - 1];
        let x = q.x * cY + q.z * sY;
        let y = q.y;
        let z = -q.x * sY + q.z * cY;
        const y2 = y * cP - z * sP;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(width * 0.5 + x * scale, height * 0.52 + y2 * scale, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

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
    <div ref={containerRef} className={`relative h-screen w-full overflow-hidden bg-[#070b12] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-move" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start px-4 pt-14 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-6xl font-black uppercase tracking-tighter md:text-8xl">{title}</h1>
        <p className="mt-3 max-w-lg font-mono text-xs opacity-70 md:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default LorenzAttractor;
