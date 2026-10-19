"use client";

/**
 * Tensegrity Mast — floating compression made visible: three steel struts
 * that never touch each other, held in the air purely by a web of
 * pretensioned cables. The simulation treats cables as pull-only
 * constraints, so slack is real — GRAB any joint and yank the tower, watch
 * cables go taut in sequence and the whole stack settle back into
 * equilibrium. WHEEL detunes the prestress and the mast visibly sags or
 * over-tightens.
 */

import React, { useEffect, useRef, useState } from "react";

interface VNode {
  x: number;
  y: number;
  px: number;
  py: number;
  pinned?: boolean;
}
interface Link {
  a: number;
  b: number;
  rest: number;
  cable: boolean; // true = pull-only
}

const GRAV = 1300;

export function TensegrityMast() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    nodes: [] as VNode[],
    links: [] as Link[],
    tension: 1,
    grabbed: -1,
    builtForW: 0,
    swayT: 0,
  });

  const [hud, setHud] = useState({ tension: 100, height: 0, taut: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;

    const build = () => {
      // 7 joints, 3 struts, alternating lean
      const cx = s.w / 2;
      const groundY = s.h * 0.86;
      const stageH = Math.min(s.h * 0.19, 150);
      const lean = Math.min(s.w * 0.055, 46);
      const layout: [number, number, boolean][] = [
        [cx - lean, groundY, true], // 0 base foot (pinned)
        [cx + lean, groundY - stageH, false], // 1
        [cx - lean * 1.15, groundY - stageH, false], // 2
        [cx + lean * 1.15, groundY - stageH * 2, false], // 3
        [cx - lean * 1.3, groundY - stageH * 2, false], // 4
        [cx + lean * 1.3, groundY - stageH * 3, false], // 5
        [cx, groundY - stageH * 3.55, false], // 6 crown
      ];
      s.nodes = layout.map(([x, y, pin]) => ({ x, y, px: x, py: y, pinned: pin }));

      const restOf = (a: VNode, b: VNode) => Math.hypot(b.x - a.x, b.y - a.y);
      const N = s.nodes;
      const mk = (i: number, j: number, cable: boolean, stretch = 1): Link => ({
        a: i,
        b: j,
        rest: restOf(N[i], N[j]) * stretch,
        cable,
      });

      s.links = [
        mk(0, 1, false), // strut 1
        mk(2, 3, false), // strut 2
        mk(4, 5, false), // strut 3
        mk(1, 2, true), // saddle cables
        mk(3, 4, true),
        mk(5, 6, true),
        mk(0, 2, true), // base bracing
        mk(1, 3, true), // long prestress diagonals
        mk(2, 4, true),
        mk(3, 5, true),
        mk(4, 6, true),
        mk(1, 4, true), // cross webs
        mk(3, 6, true),
        mk(0, 3, true, 1.04),
        mk(2, 5, true, 1.04),
      ];
      s.builtForW = s.w;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dtFrame = Math.min((now - last) / 1000, 0.033);
      last = now;
      s.swayT += dtFrame;

      // gentle ambient wind so nothing ever sits perfectly still
      const gust = Math.sin(s.swayT * 0.7) * 14 + Math.sin(s.swayT * 1.7) * 8;

      for (const n of s.nodes) {
        if (n.pinned) continue;
        const vx = (n.x - n.px) * 0.985;
        const vy = (n.y - n.py) * 0.985;
        n.px = n.x;
        n.py = n.y;
        n.x += vx + gust * dtFrame * dtFrame * 30;
        n.y += vy + GRAV * dtFrame * dtFrame * 60;
      }

      // grabbed node follows pointer
      if (s.grabbed >= 0 && pointer.current.active) {
        const g = s.nodes[s.grabbed];
        g.x += (pointer.current.x - g.x) * 0.4;
        g.y += (pointer.current.y - g.y) * 0.4;
      }

      // constraints
      for (let it = 0; it < 6; it++) {
        for (const L of s.links) {
          const a = s.nodes[L.a];
          const b = s.nodes[L.b];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.0001;
          const rest = L.rest * (L.cable ? s.tension : 1);
          const diff = (d - rest) / d;
          if (L.cable && diff < 0) continue; // slack cable does nothing
          const wa = a.pinned ? 0 : 0.5;
          const wb = b.pinned ? 0 : 0.5;
          const total = wa + wb || 1;
          const ka = L.cable ? diff * 0.85 : diff; // cables slightly springy
          a.x += dx * ka * (wa / total) * 2 * 0.5;
          a.y += dy * ka * (wa / total) * 2 * 0.5;
          b.x -= dx * ka * (wb / total) * 2 * 0.5;
          b.y -= dy * ka * (wb / total) * 2 * 0.5;
        }
        // floor
        const floor = s.h * 0.88;
        for (const n of s.nodes) {
          if (n.pinned) continue;
          if (n.y > floor) n.y = floor;
        }
      }

      // ---- draw ----------------------------------------------------------
      ctx.fillStyle = "#0e0d0c";
      ctx.fillRect(0, 0, s.w, s.h);

      // ground plinth
      ctx.fillStyle = "#17150f";
      ctx.fillRect(0, s.h * 0.88, s.w, s.h * 0.12);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, s.h * 0.88, s.w, 2);

      // cables first (under struts)
      for (const L of s.links) {
        if (!L.cable) continue;
        const a = s.nodes[L.a];
        const b = s.nodes[L.b];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const taut = d >= L.rest * s.tension * 0.995;
        ctx.strokeStyle = taut ? "rgba(245,158,11,0.75)" : "rgba(120,113,108,0.4)";
        ctx.lineWidth = taut ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // struts
      for (const L of s.links) {
        if (L.cable) continue;
        const a = s.nodes[L.a];
        const b = s.nodes[L.b];
        ctx.strokeStyle = "#b8b4ae";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        // specular stripe
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(a.x - 1.5, a.y - 1.5);
        ctx.lineTo(b.x - 1.5, b.y - 1.5);
        ctx.stroke();
        // end caps
        for (const p of [a, b]) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = "#f59e0b";
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      const N = sim.current.nodes;
      if (!N.length) return;
      let tautCount = 0;
      for (const L of sim.current.links) {
        if (!L.cable) continue;
        const d = Math.hypot(
          N[L.b].x - N[L.a].x,
          N[L.b].y - N[L.a].y
        );
        if (d >= L.rest * sim.current.tension * 0.995) tautCount++;
      }
      const crownY = N[6].y;
      setHud({
        tension: Math.round(sim.current.tension * 100),
        height: Math.max(0, Math.round(((sim.current.h * 0.86 - crownY) / (sim.current.h * 0.66)) * 100)),
        taut: tautCount,
      });
    }, 240);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const pointer = useRef({ x: 0, y: 0, active: false });

  const pickNode = (e: React.PointerEvent): number => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = -1;
    let bestD = 26;
    sim.current.nodes.forEach((n, i) => {
      if (n.pinned) return;
      const d = Math.hypot(n.x - mx, n.y - my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = wrapRef.current!.getBoundingClientRect();
    pointer.current.x = e.clientX - rect.left;
    pointer.current.y = e.clientY - rect.top;
    const hit = pickNode(e);
    if (hit < 0) return;
    sim.current.grabbed = hit;
    pointer.current.active = true;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current.x = e.clientX - rect.left;
    pointer.current.y = e.clientY - rect.top;
  };

  const onUp = () => {
    sim.current.grabbed = -1;
    pointer.current.active = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.tension = Math.max(0.82, Math.min(1.22, s.tension * (e.deltaY < 0 ? 1.03 : 0.9709)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0e0d0c] select-none">
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
          Tensegrity Mast
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Floating Compression · 3 Struts / 11 Cables
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Grab a Joint — Yank It
          <br />
          Wheel — Prestress {hud.tension}%
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Prestress">{hud.tension}%</Readout>
        <Readout label="Crown Height">{hud.height}%</Readout>
        <Readout label="Taut Lines">{hud.taut}/11</Readout>
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

export default TensegrityMast;
