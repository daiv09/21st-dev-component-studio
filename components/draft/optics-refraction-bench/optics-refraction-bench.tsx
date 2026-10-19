"use client";

/**
 * Optics Refraction Bench — a genuine Snell's-law tracer. Fifteen rays
 * leave the draggable lantern, strike the lens surfaces (parabolic
 * profiles solved as quadratics per ray), bend inside the glass, and can
 * even total-internally-reflect before exiting. WHEEL sweeps the
 * refractive index and you watch the focal point slide along the axis;
 * CLICK flips between converging and diverging figures; DRAG the lantern
 * vertically or the lens horizontally. Focal markers are derived live
 * from the lensmaker relation for the current figure.
 */

import React, { useEffect, useRef, useState } from "react";

interface Vec {
  x: number;
  y: number;
}

interface Hit {
  t: number;
  nx: number;
  ny: number;
}

export function OpticsRefractionBench() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    srcY: 0,
    lensX: 0,
    nIdx: 1.52,
    convex: true,
    drag: "" as "" | "src" | "lens",
    screenHits: [] as number[],
  });

  const [hud, setHud] = useState({ n: 1.52, f: 0, mode: "CONVERGING" });

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
      if (s.srcY === 0) s.srcY = rect.height * 0.5;
      if (s.lensX === 0) s.lensX = rect.width * 0.46;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // ---- geometry ------------------------------------------------------------
    const AP = 130; // aperture half-height
    const BULGE = 46;

    // surface: x = base + sgn·b·(1 − (y−cy)²/AP²); sgn=+1 bulges toward +x
    const solveSurface = (
      O: Vec,
      D: Vec,
      base: number,
      sgn: number,
      cy: number,
      eps: number,
    ): Hit | null => {
      // (O.x + tD.x) − base − sgn·b·(1 − ((O.y+tD.y−cy)/AP)²) = 0
      const oy = O.y - cy;
      const A = (-sgn * BULGE * D.y * D.y) / (AP * AP);
      const Bq =
        D.x +
        (2 * sgn * BULGE * oy * D.y) / (AP * AP);
      const Cq =
        O.x - base - sgn * BULGE * (1 - (oy * oy) / (AP * AP));
      const roots: number[] = [];
      if (Math.abs(A) < 1e-9) {
        if (Math.abs(Bq) > 1e-9) roots.push(-Cq / Bq);
      } else {
        const disc = Bq * Bq - 4 * A * Cq;
        if (disc >= 0) {
          const sq = Math.sqrt(disc);
          roots.push((-Bq - sq) / (2 * A), (-Bq + sq) / (2 * A));
        }
      }
      let best: Hit | null = null;
      for (const t of roots) {
        if (t <= eps) continue;
        const py = O.y + D.y * t;
        if (Math.abs(py - cy) > AP + 0.6) continue;
        // normal of F = x − base − sgn·b(1−((y−cy)/AP)²): (1, sgn·b·2(y−cy)/AP²)
        const nyRaw = (sgn * BULGE * 2 * (py - cy)) / (AP * AP);
        const len = Math.hypot(1, nyRaw);
        best = { t, nx: 1 / len, ny: nyRaw / len };
        break;
      }
      return best;
    };

    const refract = (
      D: Vec,
      nx: number,
      ny: number,
      n1: number,
      n2: number,
    ): { dir: Vec; tir: boolean } => {
      let ux = nx;
      let uy = ny;
      if (D.x * ux + D.y * uy > 0) {
        ux = -ux;
        uy = -uy;
      }
      const cosI = -(D.x * ux + D.y * uy);
      const eta = n1 / n2;
      const sin2T = eta * eta * (1 - cosI * cosI);
      if (sin2T > 1) {
        // total internal reflection
        return { dir: { x: D.x + 2 * cosI * ux, y: D.y + 2 * cosI * uy }, tir: true };
      }
      const cosT = Math.sqrt(1 - sin2T);
      return {
        dir: { x: eta * D.x + (eta * cosI - cosT) * ux, y: eta * D.y + (eta * cosI - cosT) * uy },
        tir: false,
      };
    };

    const norm = (v: Vec): Vec => {
      const l = Math.hypot(v.x, v.y) || 1;
      return { x: v.x / l, y: v.y / l };
    };

    let raf = 0;
    let hudAcc = 0;
    let last = performance.now();

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.05);
      last = nowMs;
      void dt;

      ctx.fillStyle = "#0b0a09";
      ctx.fillRect(0, 0, s.w, s.h);

      const cy = s.h * 0.5;
      const lensBase = s.convex ? s.lensX : s.lensX;
      const sgnOut = s.convex ? 1 : -1;
      // left surface bulges outward-left (−x), right surface outward-right
      const LEFT_BASE = lensBase;
      const RIGHT_BASE = lensBase;
      const sLeft = -sgnOut;
      const sRight = sgnOut;

      // optical axis
      ctx.strokeStyle = "rgba(120,113,108,0.35)";
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, cy);
      ctx.lineTo(s.w - 50, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // lens body outline (sampled parabolas)
      ctx.beginPath();
      for (let yy = -AP; yy <= AP; yy += 6) {
        const xx = LEFT_BASE + sLeft * BULGE * (1 - (yy * yy) / (AP * AP));
        if (yy === -AP) ctx.moveTo(xx, cy + yy);
        else ctx.lineTo(xx, cy + yy);
      }
      for (let yy = AP; yy >= -AP; yy -= 6) {
        const xx = RIGHT_BASE + sRight * BULGE * (1 - (yy * yy) / (AP * AP));
        ctx.lineTo(xx, cy + yy);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(231,229,228,0.07)";
      ctx.fill();
      ctx.strokeStyle = "#d6d3d1";
      ctx.lineWidth = 2;
      ctx.stroke();

      // ---- trace fan -------------------------------------------------------------
      const SRC_X = 90;
      const RAYS = 15;
      const FAN = 150; // half-fan height at emitter plane (parallel-ish beam bundle)
      s.screenHits.length = 0;
      const nAir = 1.0;
      const nGlass = s.nIdx;

      for (let ri = 0; ri < RAYS; ri++) {
        const frac = RAYS === 1 ? 0 : (ri / (RAYS - 1)) * 2 - 1;
        const O: Vec = { x: SRC_X, y: s.srcY + frac * FAN };
        let D: Vec = norm({ x: 1, y: (cy - O.y) * 0.12 }); // slight axial aim

        const pts: Vec[] = [{ ...O }];
        let inside = false;
        let guard = 0;
        let px = O.x;
        let py = O.y;
        let dir = D;

        while (px < s.w - 60 && guard++ < 8) {
          const eps = inside ? 1.5 : 0.5;
          const hit = solveSurface(
            { x: px, y: py },
            dir,
            inside ? RIGHT_BASE : LEFT_BASE,
            inside ? sRight : sLeft,
            cy,
            eps,
          );
          if (!hit) {
            // extend straight to the screen plane
            const tEdge = dir.x > 1e-6 ? (s.w - 60 - px) / dir.x : 2200;
            pts.push({ x: px + dir.x * tEdge, y: py + dir.y * tEdge });
            break;
          }
          const hx = px + dir.x * hit.t;
          const hy = py + dir.y * hit.t;
          pts.push({ x: hx, y: hy });
          const res = refract(dir, hit.nx, hit.ny, inside ? nGlass : nAir, inside ? nAir : nGlass);
          dir = res.dir;
          inside = res.tir ? inside : !inside;
          px = hx + dir.x * 0.6;
          py = hy + dir.y * 0.6;
          if (!inside && hx > s.w - 70) {
            pts.push({ x: s.w - 60, y: hy + dir.y * (s.w - 60 - hx) });
            px = s.w - 61;
            break;
          }
        }

        // record screen hit
        const lastP = pts[pts.length - 1];
        s.screenHits.push(lastP.y);

        // draw polyline — brighter core inside glass (amber), white outside
        for (let seg = 0; seg < pts.length - 1; seg++) {
          const a = pts[seg];
          const b = pts[seg + 1];
          const midIn = seg % 2 === 1;
          ctx.strokeStyle = midIn ? "#fbbf24" : "rgba(250,250,249,0.85)";
          ctx.lineWidth = midIn ? 1.6 : 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // ---- focal markers -----------------------------------------------------------
      // lensmaker estimate for parabolic thin lens: f ≈ AP² / (4·BULGE·(n−1))
      const fEst = (AP * AP) / (4 * BULGE * (nGlass - 1)) * (s.convex ? 1 : -1);
      const drawFocal = (fx: number, label: string) => {
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(fx, cy - 10);
        ctx.lineTo(fx, cy + 10);
        ctx.moveTo(fx - 6, cy);
        ctx.lineTo(fx + 6, cy);
        ctx.stroke();
        ctx.font = "9px monospace";
        ctx.fillStyle = "#f59e0b";
        ctx.textAlign = "center";
        ctx.fillText(label, fx, cy + 26);
      };
      drawFocal(lensBase + fEst, "F′");
      if (s.convex) drawFocal(lensBase - fEst, "F");

      // ---- screen ---------------------------------------------------------------------
      const SX = s.w - 56;
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(SX, cy - AP - 60, 8, (AP + 60) * 2);
      for (const hy of s.screenHits) {
        ctx.fillStyle = "#fff7ed";
        ctx.fillRect(SX - 4, hy - 1, 14, 2.4);
      }

      // ---- lantern ----------------------------------------------------------------------
      ctx.fillStyle = "#171512";
      ctx.fillRect(SRC_X - 18, s.srcY - 26, 30, 52);
      ctx.strokeStyle = "#d6d3d1";
      ctx.lineWidth = 1.6;
      ctx.strokeRect(SRC_X - 18, s.srcY - 26, 30, 52);
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(SRC_X + 8, s.srcY - 16, 5, 32);

      hudAcc += dt;
      if (hudAcc > 0.25) {
        hudAcc = 0;
        setHud({
          n: Math.round(nGlass * 100) / 100,
          f: Math.round(fEst),
          mode: s.convex ? "CONVERGING" : "DIVERGING",
        });
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const onDown = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const s = sim.current;
    const cy = rect.height * 0.5;
    if (Math.abs(mx - 90) < 44 && Math.abs(my - s.srcY) < 48) s.drag = "src";
    else if (Math.abs(mx - s.lensX) < 60 && Math.abs(my - cy) < 140) s.drag = "lens";
    else return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (!s.drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (s.drag === "src") {
      s.srcY = Math.max(rect.height * 0.16, Math.min(rect.height * 0.84, e.clientY - rect.top));
    } else {
      s.lensX = Math.max(220, Math.min(s.w - 260, e.clientX - rect.left));
    }
  };

  const onUp = () => {
    sim.current.drag = "";
  };

  const onClick = () => {
    if (sim.current.drag) return;
    sim.current.convex = !sim.current.convex;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.nIdx = Math.max(1.15, Math.min(2.4, s.nIdx + (e.deltaY < 0 ? 0.03 : -0.03)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={wrapRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={onClick}
      className="relative h-screen w-full overflow-hidden bg-[#0b0a09] select-none touch-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-grab active:cursor-grabbing" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Refraction Bench
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Snell Tracer · Parabolic Surfaces · TIR Capable
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag Lantern / Lens · Click — Flip Figure
          <br />
          Wheel — Index n = {hud.n.toFixed(2)}
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Index">{hud.n.toFixed(2)}</Readout>
        <Readout label="Focal Length">{hud.f} px</Readout>
        <Readout label="Figure">{hud.mode}</Readout>
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

export default OpticsRefractionBench;
