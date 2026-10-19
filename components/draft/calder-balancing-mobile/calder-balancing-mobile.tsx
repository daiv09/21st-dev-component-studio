"use client";

/**
 * Counterweight Sculpture — a four-tier kinetic mobile in the Calder
 * tradition, hung from a single ceiling anchor. Every arm is an independent
 * rigid pendulum whose torque comes from everything hanging off it, so the
 * sculpture hunts for equilibrium continuously. DRAG any coloured plate
 * along its beam to redistribute leverage — the whole family re-settles,
 * tier by tier, until every torque cancels.
 */

import React, { useEffect, useRef, useState } from "react";

type Hang = Plate | Arm;

interface Plate {
  kind: "plate";
  mass: number;
  color: string;
  label: string;
}
interface Arm {
  kind: "arm";
  len: number;
  wire: number;
  angle: number;
  omega: number;
  fL: number;
  fR: number;
  left: Hang;
  right: Hang;
}

const plate = (mass: number, color: string, label: string): Plate => ({
  kind: "plate",
  mass,
  color,
  label,
});

function buildTree(): Arm {
  const leafA: Arm = {
    kind: "arm", len: 190, wire: 60, angle: 0.06, omega: 0, fL: -0.42, fR: 0.42,
    left: plate(150, "#f59e0b", "P1"),
    right: plate(90, "#a3e635", "P2"),
  };
  const leafB: Arm = {
    kind: "arm", len: 160, wire: 70, angle: -0.05, omega: 0, fL: -0.38, fR: 0.44,
    left: plate(120, "#ef4444", "P3"),
    right: plate(70, "#efe7d3", "P4"),
  };
  const upperLeft: Arm = {
    kind: "arm", len: 230, wire: 80, angle: 0.04, omega: 0, fL: -0.45, fR: 0.4,
    left: leafA,
    right: plate(110, "#10b981", "P5"),
  };
  return {
    kind: "arm", len: 300, wire: 90, angle: 0.03, omega: 0, fL: -0.46, fR: 0.46,
    left: upperLeft,
    right: leafB,
  };
}

export function CalderBalancingMobile() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    root: buildTree(),
    anchor: { x: 0, y: 0 },
    grab: null as null | { arm: Arm; side: "left" | "right" },
    hoverTorque: 0,
  });

  const [hud, setHud] = useState({ tilt: 0, state: "SEEKING" });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      s.anchor = { x: rect.width / 2, y: rect.height * 0.12 };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    interface EvalOut {
      mass: number;
      cx: number;
      cy: number;
      plates: { p: Plate; hx: number; hy: number; arm: Arm; side: "left" | "right"; fx: number; fy: number }[];
      arms: { a: Arm; px: number; py: number; ex: number; ey: number; torque: number; inertia: number }[];
    }

    const evalTree = (h: Hang, px: number, py: number, out: EvalOut): void => {
      if (h.kind === "plate") {
        out.mass += h.mass;
        out.cx += h.mass * px;
        out.cy += h.mass * py;
        return;
      }
      const a = h;
      const dx = Math.cos(a.angle);
      const dy = Math.sin(a.angle);
      const hl = { x: px + dx * a.fL * a.len, y: py + dy * a.fL * a.len };
      const hr = { x: px + dx * a.fR * a.len, y: py + dy * a.fR * a.len };

      const beforeL = { m: out.mass, cx: out.cx, cy: out.cy };
      out.mass = 0; out.cx = 0; out.cy = 0;
      evalTree(a.left, hl.x, hl.y + a.wire, out);
      const lm = out.mass, lcx = out.cx, lcy = out.cy;
      out.mass = 0; out.cx = 0; out.cy = 0;
      evalTree(a.right, hr.x, hr.y + a.wire, out);
      const rm = out.mass, rcx = out.cx, rcy = out.cy;

      // record plate handles for hit-testing
      if (a.left.kind === "plate") {
        out.plates.push({ p: a.left, hx: hl.x, hy: hl.y + a.wire, arm: a, side: "left", fx: a.fL, fy: hl.y });
      }
      if (a.right.kind === "plate") {
        out.plates.push({ p: a.right, hx: hr.x, hy: hr.y + a.wire, arm: a, side: "right", fx: a.fR, fy: hr.y });
      }

      // torque about pivot (px,py): children pull downward at their centroids
      const torque =
        (lcx - px) * lm * 9.8 + (rcx - px) * rm * 9.8 +
        (hl.x - px) * 8 + (hr.x - px) * 8; // beam halves self-mass
      const inertia =
        ((hl.x - px) ** 2 + (hr.x - px) ** 2) * 8 +
        (lcx - px) ** 2 * Math.max(lm, 1) + (rcx - px) ** 2 * Math.max(rm, 1) + 400;

      out.arms.push({ a, px, py, ex: px, ey: py, torque, inertia });

      // restore accumulated totals for parent
      out.mass = beforeL.m + lm + rm;
      out.cx = beforeL.cx + lcx + rcx;
      out.cy = beforeL.cy + lcy + rcy;
    };

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      ctx.fillStyle = "#100e0c";
      ctx.fillRect(0, 0, s.w, s.h);

      // ceiling bracket
      ctx.fillStyle = "#26221c";
      ctx.fillRect(s.anchor.x - 40, s.anchor.y - 14, 80, 12);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(s.anchor.x - 40, s.anchor.y - 14, 80, 2);

      const out: EvalOut = { mass: 0, cx: 0, cy: 0, plates: [], arms: [] };

      // wire from anchor to root pivot
      const rootPivot = { x: s.anchor.x, y: s.anchor.y + s.root.wire };
      ctx.strokeStyle = "#78716c";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.anchor.x, s.anchor.y);
      ctx.lineTo(rootPivot.x, rootPivot.y);
      ctx.stroke();

      // evaluate tree (also draws wires + beams)
      const drawTree = (h: Hang, px: number, py: number) => {
        if (h.kind === "plate") return;
        const a = h;
        const dx = Math.cos(a.angle);
        const dy = Math.sin(a.angle);
        const hl = { x: px + dx * a.fL * a.len, y: py + dy * a.fL * a.len };
        const hr = { x: px + dx * a.fR * a.len, y: py + dy * a.fR * a.len };

        ctx.strokeStyle = "#a8a29e";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(hl.x, hl.y);
        ctx.lineTo(hr.x, hr.y);
        ctx.stroke();

        // hanger wires
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#57534e";
        ctx.beginPath();
        ctx.moveTo(hl.x, hl.y);
        ctx.lineTo(hl.x, hl.y + a.wire);
        ctx.moveTo(hr.x, hr.y);
        ctx.lineTo(hr.x, hr.y + a.wire);
        ctx.stroke();

        // pivot
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#d6d3d1";
        ctx.fill();

        drawTree(a.left, hl.x, hl.y + a.wire);
        drawTree(a.right, hr.x, hr.y + a.wire);
      };

      // First pass to collect handle positions, then draw, using same angles
      evalTree(s.root, rootPivot.x, rootPivot.y, out);
      drawTree(s.root, rootPivot.x, rootPivot.y);

      // draw plates from collected handles
      for (const rec of out.plates) {
        const grabbedNow =
          s.grab && s.grab.arm === rec.arm && s.grab.side === rec.side;
        ctx.fillStyle = rec.p.color;
        const w = 34 + rec.p.mass * 0.09;
        const hh = 20 + rec.p.mass * 0.04;
        ctx.beginPath();
        ctx.roundRect(rec.hx - w / 2, rec.hy - hh / 2, w, hh, 7);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (grabbedNow) {
          ctx.strokeStyle = "#fafaf9";
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = "rgba(16,14,12,0.85)";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(rec.p.label, rec.hx, rec.hy + 3);
      }

      // integrate arms
      let maxAbsTorque = 0;
      for (const rec of out.arms) {
        if (s.grab && s.grab.arm === rec.a) continue;
        const alpha = (rec.torque / rec.inertia) * 2.4;
        rec.a.omega += alpha * dt;
        rec.a.omega -= rec.a.omega * 1.35 * dt;
        rec.a.angle += rec.a.omega * dt;
        rec.a.angle = Math.max(-1.15, Math.min(1.15, rec.a.angle));
        maxAbsTorque = Math.max(maxAbsTorque, Math.abs(alpha));
      }

      s.hoverTorque = maxAbsTorque;

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      const t = sim.current.root.angle;
      setHud({
        tilt: (t * 180) / Math.PI,
        state: sim.current.hoverTorque < 0.05 ? "BALANCED" : "SEEKING",
      });
    }, 260);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  // ---- interaction ---------------------------------------------------------
  const hitTest = (e: React.PointerEvent) => {
    // re-run lightweight eval to find plate handles near pointer
    const s = sim.current;
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    interface Found { arm: Arm; side: "left" | "right" }
    let found: Found | null = null;
    let bestD = 30;
    const walk = (h: Hang, px: number, py: number) => {
      if (h.kind === "plate") return;
      const a = h;
      const dx = Math.cos(a.angle);
      const dy = Math.sin(a.angle);
      const hl = { x: px + dx * a.fL * a.len, y: py + dy * a.fL * a.len };
      const hr = { x: px + dx * a.fR * a.len, y: py + dy * a.fR * a.len };
      for (const [hangPos, side] of [
        [hl, "left"],
        [hr, "right"],
      ] as const) {
        if (side === "left" ? a.left.kind === "plate" : a.right.kind === "plate") {
          const wy = hangPos.y + a.wire;
          const d = Math.hypot(hangPos.x - mx, wy - my);
          if (d < bestD) {
            bestD = d;
            found = { arm: a, side };
          }
        }
      }
      walk(a.left, hl.x, hl.y + a.wire);
      walk(a.right, hr.x, hr.y + a.wire);
    };
    walk(s.root, s.anchor.x, s.anchor.y + s.root.wire);
    return found;
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const hit = hitTest(e);
    if (!hit) return;
    sim.current.grab = hit;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (!s.grab) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const a = s.grab.arm;
    // project pointer onto the beam's current direction from its pivot
    const dx = Math.cos(a.angle);
    const pivotX = findPivotX(s.root, s.anchor.x, a);
    const fx = (mx - pivotX) / (dx * a.len);
    const clamped = Math.max(-0.47, Math.min(0.47, fx));
    if (s.grab.side === "left") a.fL = clamped;
    else a.fR = clamped;
  };

  const findPivotX = (root: Arm, rootPx: number, target: Arm): number => {
    const walk = (h: Arm | { kind: "plate"; mass: number; color: string; label: string }, px: number): number => {
      if (h.kind !== "arm") return NaN;
      if (h === target) return px;
      const dx = Math.cos(h.angle);
      const hl = px + dx * h.fL * h.len;
      const hr = px + dx * h.fR * h.len;
      const l = h.left.kind === "arm" ? walk(h.left, hl) : NaN;
      if (!Number.isNaN(l)) return l;
      const r = h.right.kind === "arm" ? walk(h.right, hr) : NaN;
      return Number.isNaN(r) ? NaN : r;
    };
    return walk(root, rootPx);
  };

  const onUp = () => {
    sim.current.grab = null;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#100e0c] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Counterweight Sculpture
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Four-Tier Kinetic Mobile · Torque Network
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag a Plate Along Its Beam
          <br />
          Every Tier Re-Balances Beneath You
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Root Tilt">{hud.tilt.toFixed(2)}°</Readout>
        <Readout label="State">{hud.state}</Readout>
        <Readout label="Plates">5</Readout>
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-lg text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

export default CalderBalancingMobile;
