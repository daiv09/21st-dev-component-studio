"use client";

import React, { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
}

export interface AuroraVeilProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AuroraVeil({
  title = "AURORA",
  description = "Volumetric curtains over a polar range. The cursor is the magnetic pole. Click for a solar storm.",
  className = "",
}: AuroraVeilProps) {
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
    let storm = 0;
    let shockwaveRadius = 0;
    let shockwaveActive = false;
    let shockwaveCenter = { x: 0, y: 0 };

    const mouse = { x: 0.5, y: 0.38, tx: 0.5, ty: 0.38 };
    const stars: { x: number; y: number; a: number; tw: number; size: number }[] = [];
    const sparks: Spark[] = [];

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

      stars.length = 0;
      for (let i = 0; i < 260; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.75,
          a: 0.1 + Math.random() * 0.85,
          tw: Math.random() * Math.PI * 2,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / width;
      mouse.ty = (e.clientY - rect.top) / height;
    };

    const onDown = (e: PointerEvent) => {
      storm = 1;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      shockwaveActive = true;
      shockwaveRadius = 10;
      shockwaveCenter = { x, y };

      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          maxLife: Math.random() * 0.8 + 0.4,
          hue: 120 + Math.random() * 180,
          size: Math.random() * 2 + 0.8,
        });
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);

    const fbm = (x: number, t: number, o: number) =>
      Math.sin(x * 0.0028 + t * 0.4 + o) * 0.55 +
      Math.sin(x * 0.0075 - t * 0.55 + o * 1.6) * 0.3 +
      Math.sin(x * 0.016 + t * 0.85 + o * 0.5) * 0.15 +
      Math.cos(x * 0.0012 + t * 0.2) * 0.2;

    const hues = [142, 165, 182, 265, 305, 52, 130, 195];

    const tick = () => {
      time += 0.012;
      storm *= 0.95;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      // Deep atmospheric gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#010208");
      sky.addColorStop(0.4, "#040d1a");
      sky.addColorStop(0.75, "#081624");
      sky.addColorStop(1, "#0d1f1b");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Render twinkling stars with parallax feel
      for (const s of stars) {
        const tw = 0.3 + Math.sin(time * 2.5 + s.tw) * 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.a * tw * (1 + storm * 0.5)})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      ctx.globalCompositeOperation = "screen";

      // Volumetric Aurora Curtains (layered back to front)
      const curtains = 10;
      for (let c = 0; c < curtains; c++) {
        const hue = hues[c % hues.length];
        const depthFactor = c / curtains;
        const baseY = height * (0.1 + mouse.y * 0.25) + c * 16;
        const step = 4;

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width + step; x += step) {
          const n = fbm(x + c * 110, time * (1 + depthFactor * 0.2) + storm, c * 0.8);
          const pole = Math.exp(-Math.pow((x / width - mouse.x) / (0.35 + storm * 0.25), 2));
          const shafts = 0.5 + 0.5 * Math.sin(x * 0.014 + time * 1.6 + c);
          
          let shockDist = 0;
          if (shockwaveActive) {
            const dx = x - shockwaveCenter.x;
            const dy = baseY - shockwaveCenter.y;
            const dist = Math.hypot(dx, dy);
            shockDist = Math.max(0, 1 - Math.abs(dist - shockwaveRadius) / 100) * 35;
          }

          const y =
            baseY +
            n * (80 + storm * 70) * (0.5 + pole) +
            shafts * 32 * pole -
            storm * 50 * pole -
            shockDist;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const g = ctx.createLinearGradient(0, baseY - 140, 0, height * 0.95);
        const a0 = 0.0;
        const a1 = (0.32 + mouse.y * 0.15 + storm * 0.32) * (0.65 + depthFactor * 0.35);
        
        g.addColorStop(0, `hsla(${hue}, 95%, 68%, ${a0})`);
        g.addColorStop(0.15, `hsla(${hue}, 90%, 60%, ${a1})`);
        g.addColorStop(0.45, `hsla(${(hue + 28) % 360}, 85%, 50%, ${a1 * 0.4})`);
        g.addColorStop(1, "hsla(200, 40%, 8%, 0)");

        ctx.fillStyle = g;
        ctx.fill();

        // Ribbon glowing top border line
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const n = fbm(x + c * 110, time * (1 + depthFactor * 0.2) + storm, c * 0.8);
          const pole = Math.exp(-Math.pow((x / width - mouse.x) / (0.35 + storm * 0.25), 2));
          const shafts = 0.5 + 0.5 * Math.sin(x * 0.014 + time * 1.6 + c);
          const y =
            baseY +
            n * (80 + storm * 70) * (0.5 + pole) +
            shafts * 32 * pole -
            storm * 50 * pole;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue}, 100%, 82%, ${0.25 + storm * 0.35})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      // Sparkle & Magnetic Ion Dust generator
      if (Math.random() < 0.6 + storm * 2) {
        sparks.push({
          x: mouse.x * width + (Math.random() - 0.5) * 280,
          y: height * (0.18 + mouse.y * 0.22) + Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.4 - Math.random() * 1.5,
          life: 1,
          maxLife: Math.random() * 0.6 + 0.4,
          hue: hues[Math.floor(Math.random() * hues.length)],
          size: Math.random() * 1.8 + 0.8,
        });
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.016 / p.maxLife;

        ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${p.life})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.life <= 0) sparks.splice(i, 1);
      }

      // Shockwave ring update
      if (shockwaveActive) {
        shockwaveRadius += 12;
        ctx.beginPath();
        ctx.arc(shockwaveCenter.x, shockwaveCenter.y, shockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 240, 255, ${Math.max(0, 1 - shockwaveRadius / (width * 0.6)) * 0.6})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (shockwaveRadius > width * 0.6) {
          shockwaveActive = false;
        }
      }

      ctx.globalCompositeOperation = "source-over";

      // Atmospheric Ground Mountain Silhouettes
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 6) {
        const m =
          height * 0.78 +
          Math.sin(x * 0.005) * 32 +
          Math.sin(x * 0.018) * 14 +
          Math.sin(x * 0.0015) * 45;
        ctx.lineTo(x, m);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      
      const mountainGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
      mountainGrad.addColorStop(0, "#03060a");
      mountainGrad.addColorStop(1, "#010204");
      ctx.fillStyle = mountainGrad;
      ctx.fill();

      // Magnetic Pole Reticle Glow under Cursor
      const mx = mouse.x * width;
      const my = height * 0.35 + mouse.y * height * 0.2;
      const coreGlow = ctx.createRadialGradient(mx, my, 2, mx, my, 70);
      coreGlow.addColorStop(0, "rgba(160, 240, 255, 0.2)");
      coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(mx, my, 70, 0, Math.PI * 2);
      ctx.fill();

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
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden select-none bg-[#010208] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start px-4 pt-16 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl drop-shadow-[0_15px_35px_rgba(255,255,255,0.15)]">
          {title}
        </h1>
        <p className="mt-3 max-w-lg font-mono text-xs opacity-80 md:text-sm tracking-wide">
          {description}
        </p>
      </div>
    </div>
  );
}

export default AuroraVeil;