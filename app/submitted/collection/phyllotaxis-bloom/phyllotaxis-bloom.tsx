"use client";

import React, { useEffect, useRef } from "react";

export interface PhyllotaxisBloomProps {
  title?: string;
  description?: string;
  className?: string;
}

export function PhyllotaxisBloom({
  title = "PHYLLO",
  description = "Vogel’s sunflower. Cursor grows the spiral. Click to seed a new generation.",
  className = "",
}: PhyllotaxisBloomProps) {
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
    let burst = 0;
    
    // Mouse state with velocity/momentum tracking
    const mouse = { 
      x: 0.5, 
      y: 0.5, 
      tx: 0.5, 
      ty: 0.5,
      vx: 0,
      vy: 0
    };
    
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));

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
      const nx = (e.clientX - rect.left) / width;
      const ny = (e.clientY - rect.top) / height;
      mouse.vx = nx - mouse.tx;
      mouse.vy = ny - mouse.ty;
      mouse.tx = nx;
      mouse.ty = ny;
    };

    const onDown = () => {
      burst = 1.2; // Stronger initial bloom pulse on click
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt;
      
      // Smooth decay for burst and momentum damping
      burst *= Math.pow(0.05, dt);
      mouse.x += (mouse.tx - mouse.x) * (1 - Math.pow(0.1, dt));
      mouse.y += (mouse.ty - mouse.y) * (1 - Math.pow(0.1, dt));

      ctx.fillStyle = "#0a0610";
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.52;
      const n = Math.floor(320 + mouse.x * 480);
      const scale = (5.2 + mouse.y * 5.0) * (1 + burst * 0.4);
      
      // Dynamic rotation influenced by time and horizontal mouse velocity/position
      const spin = time * 0.15 + mouse.x * 0.8 + (mouse.vx * 5);

      for (let i = 0; i < n; i++) {
        const a = i * GOLDEN + spin;
        const r = scale * Math.sqrt(i);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.92;
        
        // Skip rendering points out of bounds for performance
        if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;

        const t = i / n;
        const hue = 18 + t * 60 + Math.sin(time * 0.8 + i * 0.02) * 15 + (burst * 40);
        const rad = Math.max(0.5, 1.2 + (1 - t) * 3.8 + burst * 1.8);
        
        ctx.fillStyle = `hsl(${hue}, 92%, ${48 + (1 - t) * 24}%)`;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative h-screen w-full overflow-hidden bg-[#0a0610] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-none" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start px-4 pt-14 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-6xl font-black uppercase tracking-tighter md:text-8xl">{title}</h1>
        <p className="mt-3 max-w-lg font-mono text-xs opacity-70 md:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default PhyllotaxisBloom;