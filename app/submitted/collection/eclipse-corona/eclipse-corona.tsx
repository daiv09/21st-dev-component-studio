"use client";

import React, { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface EclipseCoronaProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EclipseCorona({
  title = "ECLIPSE",
  description = "A movable moon. Horizontal covers the disk; vertical fans the corona. Click for totality.",
  className = "",
}: EclipseCoronaProps) {
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
    let pulse = 0;
    const mouse = { x: 0.62, y: 0.45, tx: 0.62, ty: 0.45 };
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
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          a: 0.1 + Math.random() * 0.7,
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

    const onDown = () => {
      pulse = 1;
      mouse.tx = 0.5;
      mouse.ty = 0.5;

      // Burst solar plasma sparks on click
      const cx = width * 0.5;
      const cy = height * 0.52;
      const R = Math.min(width, height) * 0.16;

      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        sparks.push({
          x: cx + Math.cos(angle) * R,
          y: cy + Math.sin(angle) * R,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: Math.random() * 0.6 + 0.3,
          size: Math.random() * 2 + 0.8,
        });
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);

    const tick = () => {
      time += 0.012;
      pulse *= 0.93;
      mouse.x += (mouse.tx - mouse.x) * 0.07;
      mouse.y += (mouse.ty - mouse.y) * 0.07;

      // Rich space background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#030206");
      bg.addColorStop(0.5, "#07040c");
      bg.addColorStop(1, "#020104");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle twinkling stars
      for (const s of stars) {
        const tw = 0.3 + Math.sin(time * 2 + s.tw) * 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.a * tw})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      const cx = width * 0.5;
      const cy = height * 0.52;
      const R = Math.min(width, height) * 0.16;
      const moonX = cx + (mouse.x - 0.5) * R * 2.6;
      const moonY = cy + (mouse.y - 0.5) * 40;
      const totality = 1 - Math.min(1, Math.hypot(moonX - cx, moonY - cy) / (R * 1.12));

      // Atmospheric soft corona glow backdrop
      const ambientCorona = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * (2.8 + totality * 1.5));
      ambientCorona.addColorStop(0, `rgba(255, 170, 70, ${0.15 + totality * 0.25})`);
      ambientCorona.addColorStop(0.4, `rgba(255, 110, 30, ${0.06 + totality * 0.12})`);
      ambientCorona.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambientCorona;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 4, 0, Math.PI * 2);
      ctx.fill();

      // Volumetric Corona Rays (Multi-pass rendering)
      const rays = 180;
      const fan = 0.6 + (1 - mouse.y) * 1.5 + pulse * 1.1;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2 + time * 0.035;
        const wobble = 0.6 + 0.45 * Math.sin(a * 4 + time * 1.2) + 0.25 * Math.sin(a * 9 - time * 1.8);
        const len = R * (1.3 + fan * wobble * (0.5 + totality * 1.2));
        
        ctx.strokeStyle = `hsla(${32 + wobble * 22}, 100%, ${65 + totality * 25}%, ${0.05 + totality * 0.22})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.restore();

      ctx.globalCompositeOperation = "source-over";

      // Solar Disk (Sun)
      const sun = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
      sun.addColorStop(0, "#ffffff");
      sun.addColorStop(0.5, "#fff2b2");
      sun.addColorStop(0.85, "#ffa834");
      sun.addColorStop(1, "#ff6b10");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Moon Disk (Dark Body)
      ctx.fillStyle = "#040207";
      ctx.beginPath();
      ctx.arc(moonX, moonY, R * 1.015, 0, Math.PI * 2);
      ctx.fill();

      // Moon atmospheric limb glow / back-scattering rim
      const limb = ctx.createRadialGradient(moonX - 6, moonY - 6, R * 0.3, moonX, moonY, R * 1.03);
      limb.addColorStop(0.7, "rgba(0,0,0,0)");
      limb.addColorStop(1, `rgba(255, 190, 90, ${0.12 + totality * 0.42})`);
      ctx.fillStyle = limb;
      ctx.beginPath();
      ctx.arc(moonX, moonY, R * 1.02, 0, Math.PI * 2);
      ctx.fill();

      // Diamond Ring effect (Baily's Beads / Glare flare at peak totality)
      if (totality > 0.82) {
        const flareAngle = Math.atan2(cy - moonY, cx - moonX) + Math.PI;
        const fx = cx + Math.cos(flareAngle) * R * 0.94;
        const fy = cy + Math.sin(flareAngle) * R * 0.94;
        
        const diamond = ctx.createRadialGradient(fx, fy, 1, fx, fy, R * 0.6);
        diamond.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        diamond.addColorStop(0.2, "rgba(255, 220, 140, 0.6)");
        diamond.addColorStop(1, "rgba(255, 120, 30, 0)");
        
        ctx.fillStyle = diamond;
        ctx.beginPath();
        ctx.arc(fx, fy, R * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Floating Corona Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.016 / p.maxLife;

        ctx.fillStyle = `rgba(255, 200, 120, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) sparks.splice(i, 1);
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
    <div ref={containerRef} className={`relative h-screen w-full overflow-hidden bg-[#030206] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start px-4 pt-14 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-6xl font-black uppercase tracking-tighter md:text-8xl drop-shadow-[0_15px_30px_rgba(255,255,255,0.2)]">
          {title}
        </h1>
        <p className="mt-3 max-w-lg font-mono text-xs opacity-75 md:text-sm tracking-wide">
          {description}
        </p>
      </div>
    </div>
  );
}

export default EclipseCorona;