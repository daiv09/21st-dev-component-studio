"use client";

import React, { useEffect, useRef } from "react";

export interface MoireShearFieldProps {
  title?: string;
  description?: string;
  className?: string;
}

export function MoireShearField({
  title = "MOIRÉ",
  description = "Three chromatic lattices in a gravity well. Click to cycle radial / linear / spiral. Cursor dents space.",
  className = "",
}: MoireShearFieldProps) {
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
    let mode = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 };

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
    const onDown = () => {
      mode = (mode + 1) % 3;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("pointerdown", onDown);

    const warp = (x: number, y: number, cx: number, cy: number, intensity = 1) => {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy) + 1;
      const wave = Math.sin(d * 0.03 - time * 3) * 12 * intensity;
      const k = 1 + (110 * 110) / (d * d + 1) + wave / d;
      const dent = Math.min(2.4, Math.max(0.6, k));
      return { x: cx + dx * (dent * 0.5 + 0.5), y: cy + dy * (dent * 0.5 + 0.5) };
    };

    const drawRadial = (cx: number, cy: number, rot: number, color: string, rings: number, spokes: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.95;
      const maxR = Math.hypot(width, height) * 0.85;
      const breath = 1 + Math.sin(time * 0.8) * 0.04;
      
      for (let i = 1; i <= rings; i++) {
        const r = (i / rings) * maxR * breath;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * maxR, Math.sin(a) * maxR);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawLinear = (cx: number, cy: number, rot: number, color: string, gap: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.95;
      const span = Math.hypot(width, height);
      const breath = gap * (1 + Math.sin(time * 0.9) * 0.08);
      for (let x = -span; x <= span; x += breath) {
        ctx.beginPath();
        ctx.moveTo(x, -span);
        ctx.lineTo(x + Math.sin(time * 0.5) * 20, span);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawSpiral = (cx: number, cy: number, rot: number, color: string, arms: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.1;
      const maxR = Math.hypot(width, height) * 0.75;
      for (let a = 0; a < arms; a++) {
        ctx.beginPath();
        for (let i = 0; i <= 480; i++) {
          const t = i / 480;
          const ang = t * Math.PI * 12 + (a / arms) * Math.PI * 2 + time * 0.3;
          const r = t * maxR * (1 + Math.cos(time + t * 5) * 0.05);
          const x = Math.cos(ang) * r;
          const y = Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt;
      
      // Smooth out mouse velocity and position using delta time damping
      const prevX = mouse.x;
      const prevY = mouse.y;
      const lerpFactor = 1 - Math.pow(0.08, dt);
      mouse.x += (mouse.tx - mouse.x) * lerpFactor;
      mouse.y += (mouse.ty - mouse.y) * lerpFactor;
      mouse.vx = mouse.x - prevX;
      mouse.vy = mouse.y - prevY;

      // Rich dynamic background wipe with smooth motion trail
      ctx.fillStyle = "rgba(5, 4, 10, 0.4)";
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const mx = cx + mouse.x * width * 0.48;
      const my = cy + mouse.y * height * 0.48;

      // Layer orbital math for fluid constant movement
      const orbitA = time * 0.4;
      const orbitB = time * -0.3;
      const orbitC = time * 0.25;

      const posAX = cx + Math.cos(orbitA) * 60 - mouse.x * 90;
      const posAY = cy + Math.sin(orbitA) * 60 - mouse.y * 70;
      const posBX = cx + Math.sin(orbitB) * 80 + mouse.x * 70;
      const posBY = cy + Math.cos(orbitB) * 80 + mouse.y * 60;
      const posCX = cx + Math.sin(orbitC) * 50 + mouse.y * 50;
      const posCY = cy + Math.cos(orbitC) * 50 - mouse.x * 50;

      const a = warp(posAX, posAY, mx, my, 1.2);
      const b = warp(posBX, posBY, mx, my, 0.9);
      const c = warp(posCX, posCY, mx, my, 0.6);

      ctx.globalCompositeOperation = "screen";
      
      if (mode === 0) {
        drawRadial(a.x, a.y, time * 0.08 + mouse.x * 0.6, "rgba(255, 45, 100, 0.5)", 58, 90);
        drawRadial(b.x, b.y, -time * 0.07 - mouse.y * 0.7, "rgba(20, 230, 255, 0.45)", 58, 90);
        drawRadial(c.x, c.y, time * 0.05 + Math.sin(time * 0.5) * 0.2, "rgba(255, 200, 50, 0.35)", 40, 56);
      } else if (mode === 1) {
        drawLinear(a.x, a.y, mouse.x * 1.2 + time * 0.06, "rgba(255, 45, 100, 0.45)", 11);
        drawLinear(b.x, b.y, mouse.y * 1.2 - time * 0.05 + 0.5, "rgba(20, 230, 255, 0.42)", 12);
        drawLinear(c.x, c.y, 1.1 + mouse.x * 0.3 + Math.cos(time * 0.4) * 0.2, "rgba(255, 200, 50, 0.3)", 16);
      } else {
        drawSpiral(a.x, a.y, time * 0.12, "rgba(255, 45, 100, 0.5)", 9);
        drawSpiral(b.x, b.y, -time * 0.1 + mouse.x * 1.5, "rgba(20, 230, 255, 0.45)", 9);
        drawSpiral(c.x, c.y, time * 0.05, "rgba(255, 200, 50, 0.35)", 6);
      }

      ctx.globalCompositeOperation = "source-over";

      // Cursor gravity well glow effect
      const cursorPulse = 100 + Math.sin(time * 4) * 15;
      const g = ctx.createRadialGradient(mx, my, 2, mx, my, cursorPulse);
      g.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      g.addColorStop(0.5, "rgba(100, 200, 255, 0.08)");
      g.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(mx, my, cursorPulse, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    };

    // Initial clear screen
    ctx.fillStyle = "#05040a";
    ctx.fillRect(0, 0, width, height);

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
      className={`relative h-screen w-full overflow-hidden select-none bg-[#05040a] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-4 text-center mix-blend-difference text-white">
        <h1 className="font-mono text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
          {title}
        </h1>
        <p className="mt-3 max-w-lg font-mono text-xs opacity-75 md:text-sm tracking-wide">
          {description}
        </p>
      </div>
    </div>
  );
}

export default MoireShearField;