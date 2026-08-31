"use client";

/**
 * PhosphorRadar — a PPI radar scope with real phosphor persistence.
 * The canvas is never fully cleared: each frame paints a translucent veil,
 * so sweeps and contacts burn afterglow trails exactly like a CRT.
 * HOVER a contact to interrogate it · WHEEL changes range scale ·
 * CLICK drops waypoint beacons.
 */

import React, { useEffect, useRef, useState } from "react";

interface Blip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: string;
  hostile: boolean;
  spd: number;
  glow: number;
}

interface Waypoint {
  x: number;
  y: number;
  label: string;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

const GREEN = "74, 222, 128";
const AMBER = "251, 191, 36";
const RED = "248, 113, 113";
const RANGE_MAX_KM = 480;

function normAngle(a: number): number {
  const t = a % (Math.PI * 2);
  return t < 0 ? t + Math.PI * 2 : t;
}

/** Smallest signed difference between two angles, in (-PI, PI]. */
function angDiff(a: number, b: number): number {
  let d = normAngle(a - b);
  if (d > Math.PI) d -= Math.PI * 2;
  return d;
}

export function PhosphorRadar() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rangeScale, setRangeScale] = useState(1);

  const zoomRef = useRef(1);
  const sweepRef = useRef(-Math.PI / 2);
  const mouseRef = useRef({ x: -1, y: -1, inside: false });
  const blipsRef = useRef<Blip[]>([]);
  const waypointsRef = useRef<Waypoint[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const wpCounter = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let radius = 100;
    let last = performance.now();
    let firstFrame = true;

    // --- Contacts -----------------------------------------------------------
    const spawnBlips = () => {
      const blips: Blip[] = [];
      for (let i = 0; i < 13; i++) {
        const a = (i / 13) * Math.PI * 2 + (i * 1.7) % 2.1;
        const rr = radius * (0.15 + ((i * 37) % 70) / 100);
        const speed = 14 + ((i * 53) % 40);
        blips.push({
          x: cx + Math.cos(a) * rr,
          y: cy + Math.sin(a) * rr,
          vx: Math.cos(a + 1.3) * speed,
          vy: Math.sin(a + 1.3) * speed,
          id: `T-${String(i + 11).padStart(2, "0")}`,
          hostile: i % 5 === 0,
          spd: 210 + ((i * 97) % 340),
          glow: 0,
        });
      }
      blipsRef.current = blips;
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      cx = width / 2;
      cy = height / 2;
      radius = Math.min(width, height) / 2 - 64;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Paint the tube black on resize; persistence takes over from here.
      ctx.fillStyle = "#020806";
      ctx.fillRect(0, 0, width, height);
      spawnBlips();
      firstFrame = true;
    };

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.inside = true;
    };
    const onLeave = () => {
      mouseRef.current.inside = false;
    };
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dxp = x - cx;
      const dyp = y - cy;
      if (Math.hypot(dxp, dyp) > radius) return;
      wpCounter.current += 1;
      const list = waypointsRef.current;
      list.push({ x, y, label: `WP-${String(wpCounter.current).padStart(2, "0")}` });
      if (list.length > 6) list.shift();
      ripplesRef.current.push({ x, y, r: 4, alpha: 0.9 });
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = zoomRef.current * (e.deltaY < 0 ? 1.12 : 0.893);
      zoomRef.current = Math.min(1.8, Math.max(0.55, next));
      setRangeScale(zoomRef.current);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    handleResize();

    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });
    container.addEventListener("click", onClick);
    container.addEventListener("wheel", onWheel, { passive: false });

    // --- Frame --------------------------------------------------------------
    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const zoom = zoomRef.current;

      // Phosphor veil — never a hard clear.
      ctx.fillStyle = "rgba(2, 8, 6, 0.055)";
      ctx.fillRect(0, 0, width, height);

      if (firstFrame) {
        ctx.fillStyle = "#020806";
        ctx.fillRect(0, 0, width, height);
        firstFrame = false;
      }

      // Scope clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // --- Sweep ------------------------------------------------------------
      const sweepSpeed = (12 * 6 * Math.PI) / 180; // 12 rpm in rad/s
      const prevSweep = sweepRef.current;
      sweepRef.current = normAngle(sweepRef.current + sweepSpeed * dt);
      const sweep = sweepRef.current;

      // Afterglow wedge: stepped strokes behind the head (no fill ramps).
      const steps = 42;
      for (let i = 0; i < steps; i++) {
        const a = sweep - (sweepSpeed * dt * i) / 1.4;
        const alpha = 0.30 * Math.pow(1 - i / steps, 2.2);
        ctx.strokeStyle = `rgba(${GREEN}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        ctx.stroke();
      }
      // Head
      ctx.strokeStyle = `rgba(${GREEN}, 0.85)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * radius, cy + Math.sin(sweep) * radius);
      ctx.stroke();

      // --- Contacts ---------------------------------------------------------
      for (const b of blipsRef.current) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const dx = b.x - cx;
        const dy = b.y - cy;
        const d = Math.hypot(dx, dy);
        const maxR = radius * 0.96;
        if (d > maxR) {
          // Reflect inward
          const nx = dx / d;
          const ny = dy / d;
          const dot = b.vx * nx + b.vy * ny;
          b.vx -= 2 * dot * nx;
          b.vy -= 2 * dot * ny;
          b.x = cx + nx * maxR;
          b.y = cy + ny * maxR;
        }

        // Sweep illumination
        const bearing = Math.atan2(b.y - cy, b.x - cx);
        if (Math.abs(angDiff(sweep, bearing)) < 0.06) b.glow = 1;
        b.glow *= 0.988;

        const px = cx + (b.x - cx) * zoom;
        const py = cy + (b.y - cy) * zoom;
        const rgb = b.hostile ? RED : GREEN;
        const alpha = Math.max(b.glow * 0.95, 0.14);

        ctx.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.4 + b.glow * 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (b.glow > 0.35) {
          ctx.strokeStyle = `rgba(${rgb}, ${(b.glow * 0.5).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, 7 + (1 - b.glow) * 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // --- Waypoints + ripples ----------------------------------------------
      for (const w of waypointsRef.current) {
        const px = cx + (w.x - cx) * zoom;
        const py = cy + (w.y - cy) * zoom;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = `rgba(${AMBER}, 0.9)`;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-4.5, -4.5, 9, 9);
        ctx.restore();
        ctx.fillStyle = `rgba(${AMBER}, 0.85)`;
        ctx.font = "9px ui-monospace, monospace";
        ctx.fillText(w.label, px + 8, py - 8);
      }
      ripplesRef.current = ripplesRef.current.filter((rp) => rp.alpha > 0.02);
      for (const rp of ripplesRef.current) {
        rp.r += 140 * dt;
        rp.alpha *= Math.pow(0.05, dt);
        ctx.strokeStyle = `rgba(${AMBER}, ${rp.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore(); // end clip

      // --- Furniture (crisp, redrawn every frame) ---------------------------
      ctx.strokeStyle = `rgba(${GREEN}, 0.22)`;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius * i) / 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${GREEN}, 0.45)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      // Degree ticks + labels
      ctx.font = "9px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let deg = 0; deg < 360; deg += 10) {
        const major = deg % 30 === 0;
        const a = ((deg - 90) * Math.PI) / 180;
        const r1 = radius + 2;
        const r2 = radius + (major ? 14 : 8);
        ctx.strokeStyle = `rgba(${GREEN}, ${major ? 0.6 : 0.28})`;
        ctx.lineWidth = major ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
        if (major) {
          ctx.fillStyle = `rgba(${GREEN}, 0.55)`;
          ctx.fillText(
            String(deg).padStart(3, "0"),
            cx + Math.cos(a) * (radius + 27),
            cy + Math.sin(a) * (radius + 27)
          );
        }
      }

      // --- Cursor interrogation ---------------------------------------------
      const m = mouseRef.current;
      if (m.inside) {
        const dx = m.x - cx;
        const dy = m.y - cy;
        const dist = Math.hypot(dx, dy);
        const brg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;

        ctx.strokeStyle = `rgba(${GREEN}, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(m.x - 9, m.y);
        ctx.lineTo(m.x + 9, m.y);
        ctx.moveTo(m.x, m.y - 9);
        ctx.lineTo(m.x, m.y + 9);
        ctx.stroke();

        if (dist <= radius) {
          const rngKm = (dist / (radius * zoom)) * RANGE_MAX_KM;
          ctx.fillStyle = `rgba(${GREEN}, 0.9)`;
          ctx.font = "10px ui-monospace, monospace";
          ctx.textAlign = "left";
          ctx.fillText(
            `BRG ${brg.toFixed(0).padStart(3, "0")}°  RNG ${rngKm.toFixed(0)} KM`,
            m.x + 14,
            m.y + 18
          );

          // Hover identification
          let near: Blip | null = null;
          let bestD = 26;
          for (const b of blipsRef.current) {
            const px = cx + (b.x - cx) * zoom;
            const py = cy + (b.y - cy) * zoom;
            const dd = Math.hypot(m.x - px, m.y - py);
            if (dd < bestD) {
              bestD = dd;
              near = b;
            }
          }
          if (near) {
            const npx = cx + (near.x - cx) * zoom;
            const npy = cy + (near.y - cy) * zoom;
            const nBrg = (((Math.atan2(npx - cx, -(npy - cy)) * 180) / Math.PI) + 360) % 360;
            const nRng = (Math.hypot(npx - cx, npy - cy) / (radius * zoom)) * RANGE_MAX_KM;
            const rgb = near.hostile ? RED : GREEN;

            ctx.strokeStyle = `rgba(${rgb}, 0.75)`;
            ctx.beginPath();
            ctx.moveTo(npx, npy);
            ctx.lineTo(npx + 26, npy - 26);
            ctx.lineTo(npx + 148, npy - 26);
            ctx.stroke();
            ctx.fillStyle = "rgba(1, 10, 6, 0.92)";
            ctx.fillRect(npx + 26, npy - 66, 122, 40);
            ctx.strokeRect(npx + 26, npy - 66, 122, 40);
            ctx.fillStyle = `rgba(${rgb}, 0.95)`;
            ctx.font = "bold 10px ui-monospace, monospace";
            ctx.fillText(`${near.id} ${near.hostile ? "HOSTILE" : "FRIENDLY"}`, npx + 32, npy - 52);
            ctx.font = "9px ui-monospace, monospace";
            ctx.fillStyle = `rgba(${GREEN}, 0.8)`;
            ctx.fillText(
              `BRG ${nBrg.toFixed(0).padStart(3, "0")} RNG ${nRng.toFixed(0)} SPD ${near.spd}`,
              npx + 32,
              npy - 38
            );
          }
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("click", onClick);
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#020806] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />

      {/* Title */}
      <div className="absolute top-7 left-9 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-emerald-300 uppercase">
          Phosphor Radar
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-emerald-800 uppercase">
          AN/TPS-Ω · Plan Position Indicator
        </p>
      </div>

      {/* Hints */}
      <div className="absolute top-7 right-9 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-emerald-900 uppercase leading-relaxed">
          Wheel — Range Scale
          <br />
          Click — Drop Beacon
          <br />
          Hover — Identify Track
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-9 flex items-center gap-6 pointer-events-none">
        {[
          { c: "#f87171", t: "Hostile" },
          { c: "#4ade80", t: "Friendly" },
          { c: "#fbbf24", t: "Beacon" },
        ].map((l) => (
          <span key={l.t} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: l.c, boxShadow: `0 0 8px ${l.c}` }}
            />
            <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-700 uppercase">
              {l.t}
            </span>
          </span>
        ))}
      </div>

      {/* Status */}
      <div className="absolute bottom-8 right-9 flex items-center gap-8 pointer-events-none font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-700">
        <span>Sweep 12.0 RPM</span>
        <span>
          Range{" "}
          <span className="text-emerald-300">{Math.round(RANGE_MAX_KM / rangeScale)}</span> KM
        </span>
      </div>
    </div>
  );
}

export default PhosphorRadar;
