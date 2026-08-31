"use client";

/**
 * Signal Crossing Bench — four-lane intersection running a real
 * Intelligent-Driver-Model car-following loop: every vehicle accelerates
 * against its leader's gap and the stop line, so queues compress,
 * shockwaves ripple back, and jams dissolve organically when the phases
 * rotate. Signals run a fixed plan with yellow clearance; CLICK a signal
 * head to force-hold that road green for six seconds and watch the cross
 * street pile up. WHEEL tunes demand pressure.
 */

import React, { useEffect, useRef, useState } from "react";

interface Car {
  s: number; // metres-along-lane in px from entry
  v: number;
  len: number;
  wid: number;
  body: string;
  roof: string;
}

interface Lane {
  axis: "h" | "v";
  dir: 1 | -1; // travel direction sign across screen
  off: number; // lateral offset from centre line (px)
  road: "NS" | "EW";
  stopS: number; // distance-from-entry of its stop line (set on resize)
  cars: Car[];
}

const CYCLE = [
  { road: "NS" as const, state: "GREEN" as const, dur: 4.4 },
  { road: "NS" as const, state: "YELLOW" as const, dur: 1.1 },
  { road: "EW" as const, state: "GREEN" as const, dur: 4.4 },
  { road: "EW" as const, state: "YELLOW" as const, dur: 1.1 },
];

const CAR_COLORS: [string, string][] = [
  ["#efe7d3", "#b9ac91"],
  ["#fbbf24", "#92610a"],
  ["#ef4444", "#7f1d1d"],
  ["#fafaf9", "#8b8883"],
  ["#d4a24e", "#6b4b13"],
];

export function TrafficSignalIntersection() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    t: 0,
    lanes: [] as Lane[],
    spawnAcc: 0,
    demand: 1,
    holdRoad: "" as "" | "NS" | "EW",
    holdUntil: 0,
    exits: [] as number[],
    throughput: 0,
    avgV: 0,
    jamMax: 0,
    phaseIdx: 0,
  });

  const [hud, setHud] = useState({ flow: 0, avg: 0, jam: 0, phase: "NS GREEN" });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;

    const mkLanes = () => {
      s.lanes = [
        { axis: "h", dir: 1, off: -16, road: "EW", stopS: 0, cars: [] },
        { axis: "h", dir: -1, off: 16, road: "EW", stopS: 0, cars: [] },
        { axis: "v", dir: 1, off: -16, road: "NS", stopS: 0, cars: [] },
        { axis: "v", dir: -1, off: 16, road: "NS", stopS: 0, cars: [] },
      ];
    };
    mkLanes();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      const cx = s.w / 2;
      const cy = s.h / 2;
      for (const ln of s.lanes) {
        // stop line sits one car-length before the far curb of the box
        ln.stopS =
          ln.axis === "h"
            ? ln.dir === 1
              ? cx - 34
              : s.w - cx - 34
            : ln.dir === 1
              ? cy - 34
              : s.h - cy - 34;
      }
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const lightFor = (road: "NS" | "EW"): "GREEN" | "YELLOW" | "RED" => {
      if (s.holdRoad && s.t < s.holdUntil) {
        return s.holdRoad === road ? "GREEN" : "RED";
      }
      let acc = 0;
      for (let i = 0; i < CYCLE.length; i++) {
        acc += CYCLE[i].dur;
        if (s.t % 11 < acc) {
          s.phaseIdx = i;
          return CYCLE[i].road === road ? CYCLE[i].state : "RED";
        }
      }
      return "RED";
    };

    const spawnCar = (ln: Lane): void => {
      const last = ln.cars[ln.cars.length - 1];
      if (last && last.s < 52) return;
      const [body, roof] = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
      ln.cars.push({
        s: 0,
        v: 60 + Math.random() * 30,
        len: 24 + Math.random() * 10,
        wid: 12,
        body,
        roof,
      });
    };

    // IDM constants (px units)
    const A_MAX = 95;
    const B_COMF = 72;
    const V0 = 118;
    const T_HEAD = 0.85;
    const S0 = 15;

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.05);
      last = nowMs;
      s.t += dt;

      // ---- spawning -------------------------------------------------------
      s.spawnAcc += dt * s.demand;
      while (s.spawnAcc > 0.75) {
        s.spawnAcc -= 0.75;
        const ln = s.lanes[Math.floor(Math.random() * s.lanes.length)];
        spawnCar(ln);
      }

      // ---- physics ---------------------------------------------------------
      let sumV = 0;
      let nCars = 0;
      let jam = 0;
      for (const ln of s.lanes) {
        const light = lightFor(ln.road);
        for (let i = 0; i < ln.cars.length; i++) {
          const car = ln.cars[i];
          // leader gap
          let gap = 9999;
          let dv = 0;
          if (i > 0) {
            const lead = ln.cars[i - 1];
            gap = lead.s - lead.len - car.s;
            dv = car.v - lead.v;
          }
          // red/yellow light as a standing obstacle at the stop line
          if (light !== "GREEN") {
            const dStop = ln.stopS - car.s - 4;
            if (dStop >= -car.len * 0.4 && dStop < gap) {
              gap = dStop;
              dv = car.v;
            }
          }
          let acc: number;
          if (gap <= 0.01) {
            acc = -B_COMF * 2;
          } else {
            const sStar = S0 + Math.max(0, car.v * T_HEAD + (car.v * dv) / (2 * Math.sqrt(A_MAX * B_COMF)));
            acc = A_MAX * (1 - Math.pow(car.v / V0, 4) - Math.pow(sStar / gap, 2));
            acc = Math.max(-B_COMF * 2.2, acc);
          }
          car.v = Math.max(0, car.v + acc * dt);
          car.s += car.v * dt;
          sumV += car.v;
          nCars++;
        }
        // exited?
        const exitLen =
          (ln.axis === "h" ? s.w : s.h) + 60;
        while (ln.cars.length && ln.cars[0].s > exitLen) {
          ln.cars.shift();
          s.exits.push(s.t);
        }
        // queue measure: standstill count behind line
        let q = 0;
        for (const c of ln.cars) {
          if (c.v < 6 && c.s < ln.stopS + 220) q++;
        }
        jam = Math.max(jam, q);
      }
      while (s.exits.length && s.exits[0] < s.t - 20) s.exits.shift();
      s.throughput = s.exits.length / 20 * 60;
      s.avgV = nCars ? sumV / nCars : 0;
      s.jamMax += (jam - s.jamMax) * Math.min(1, dt * 2);

      // ---- draw --------------------------------------------------------------
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, s.w, s.h);
      const cx = s.w / 2;
      const cy = s.h / 2;
      const ROAD_W = 96;

      // asphalt bands
      ctx.fillStyle = "#1c1c1c";
      ctx.fillRect(0, cy - ROAD_W / 2, s.w, ROAD_W);
      ctx.fillRect(cx - ROAD_W / 2, 0, ROAD_W, s.h);

      // centre dashes away from the box
      ctx.strokeStyle = "#d6d3d1";
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 18]);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(cx - ROAD_W / 2 - 8, cy);
      ctx.moveTo(cx + ROAD_W / 2 + 8, cy);
      ctx.lineTo(s.w, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cy - ROAD_W / 2 - 8);
      ctx.moveTo(cx, cy + ROAD_W / 2 + 8);
      ctx.lineTo(cx, s.h);
      ctx.stroke();
      ctx.setLineDash([]);

      // crosswalk zebra
      ctx.fillStyle = "#d6d3d1";
      for (let i = -3; i <= 3; i++) {
        ctx.fillRect(cx - ROAD_W / 2 - 22, cy + i * 12 + 2, 16, 7);
        ctx.fillRect(cx + ROAD_W / 2 + 6, cy + i * 12 + 2, 16, 7);
        ctx.fillRect(cx + i * 12 + 2, cy - ROAD_W / 2 - 22, 7, 16);
        ctx.fillRect(cx + i * 12 + 2, cy + ROAD_W / 2 + 6, 7, 16);
      }

      // stop bars per approach (colored by live signal)
      for (const ln of s.lanes) {
        const st = lightFor(ln.road);
        ctx.fillStyle = st === "GREEN" ? "#22c55e" : st === "YELLOW" ? "#fbbf24" : "#ef4444";
        if (ln.axis === "h") {
          const bx = ln.dir === 1 ? cx - ROAD_W / 2 - 6 : cx + ROAD_W / 2 + 2;
          ctx.fillRect(bx, cy + ln.off - 9, 4, 18);
        } else {
          const by = ln.dir === 1 ? cy - ROAD_W / 2 - 6 : cy + ROAD_W / 2 + 2;
          ctx.fillRect(cx + ln.off - 9, by, 18, 4);
        }
      }

      // cars
      for (const ln of s.lanes) {
        for (const c of ln.cars) {
          let px: number;
          let py: number;
          let ang: number;
          if (ln.axis === "h") {
            px = ln.dir === 1 ? c.s : s.w - c.s;
            py = cy + ln.off;
            ang = ln.dir === 1 ? 0 : Math.PI;
          } else {
            px = cx + ln.off;
            py = ln.dir === 1 ? c.s : s.h - c.s;
            ang = ln.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
          }
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ang);
          const hw = c.len / 2;
          const hh = c.wid / 2;
          ctx.fillStyle = c.body;
          ctx.beginPath();
          ctx.roundRect(-hw, -hh, c.len, c.wid, 3);
          ctx.fill();
          ctx.fillStyle = c.roof;
          ctx.fillRect(-hw * 0.28, -hh + 2, c.len * 0.36, c.wid - 4);
          // hard shadow edge
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(-hw, hh - 2, c.len, 2);
          // brake glow when slow but approaching
          if (c.v < 10) {
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(-hw - 2, -hh + 1, 2.4, c.wid - 2);
          }
          ctx.restore();
        }
      }

      // signal heads (four corners)
      const heads: { x: number; y: number; road: "NS" | "EW"; label: string }[] = [
        { x: cx - ROAD_W / 2 - 44, y: cy - ROAD_W / 2 - 30, road: "NS", label: "N-S" },
        { x: cx + ROAD_W / 2 + 44, y: cy + ROAD_W / 2 + 30, road: "NS", label: "N-S" },
        { x: cx + ROAD_W / 2 + 44, y: cy - ROAD_W / 2 - 30, road: "EW", label: "E-W" },
        { x: cx - ROAD_W / 2 - 44, y: cy + ROAD_W / 2 + 30, road: "EW", label: "E-W" },
      ];
      for (const hd of heads) {
        const st = lightFor(hd.road);
        const held = s.holdRoad === hd.road && s.t < s.holdUntil;
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(hd.x - 11, hd.y - 29, 22, 58);
        ctx.strokeStyle = held ? "#fbbf24" : "#3f3f46";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(hd.x - 11, hd.y - 29, 22, 58);
        const lamps: [string, string, boolean][] = [
          ["#ef4444", "#450a0a", st === "RED"],
          ["#fbbf24", "#451a03", st === "YELLOW"],
          ["#22c55e", "#052e16", st === "GREEN"],
        ];
        lamps.forEach(([on, off, lit], li) => {
          ctx.beginPath();
          ctx.arc(hd.x, hd.y - 19 + li * 19, 7, 0, Math.PI * 2);
          ctx.fillStyle = lit ? on : off;
          ctx.fill();
          if (lit) {
            ctx.beginPath();
            ctx.arc(hd.x, hd.y - 19 + li * 19, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.55)";
            ctx.fill();
          }
        });
      }

      hudAcc += dt;
      if (hudAcc > 0.35) {
        hudAcc = 0;
        const cur = CYCLE[s.phaseIdx];
        setHud({
          flow: Math.round(s.throughput),
          avg: Math.round(s.avgV),
          jam: Math.round(s.jamMax),
          phase: s.holdRoad && s.t < s.holdUntil
            ? `HOLD ${s.holdRoad}`
            : `${cur.road} ${cur.state}`,
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

  const onClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = sim.current.w / 2;
    const cy = sim.current.h / 2;
    const ROAD_W = 96;
    const heads: { x: number; y: number; road: "NS" | "EW" }[] = [
      { x: cx - ROAD_W / 2 - 44, y: cy - ROAD_W / 2 - 30, road: "NS" },
      { x: cx + ROAD_W / 2 + 44, y: cy + ROAD_W / 2 + 30, road: "NS" },
      { x: cx + ROAD_W / 2 + 44, y: cy - ROAD_W / 2 - 30, road: "EW" },
      { x: cx - ROAD_W / 2 - 44, y: cy + ROAD_W / 2 + 30, road: "EW" },
    ];
    for (const hd of heads) {
      if (Math.abs(mx - hd.x) < 26 && Math.abs(my - hd.y) < 42) {
        sim.current.holdRoad = hd.road;
        sim.current.holdUntil = sim.current.t + 6;
        return;
      }
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = sim.current.demand;
      sim.current.demand = Math.max(0.2, Math.min(4, d * (e.deltaY < 0 ? 1.12 : 0.8929)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={wrapRef}
      onClick={onClick}
      className="relative h-screen w-full overflow-hidden bg-[#121212] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-pointer" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Signal Crossing Bench
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Intelligent Driver Model · Four Approaches
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Click Signal Head — Force-Hold Green 6 s
          <br />
          Wheel — Demand Pressure
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Flow">{hud.flow}/min</Readout>
        <Readout label="Avg Speed">{hud.avg}</Readout>
        <Readout label="Queue Peak">{hud.jam}</Readout>
        <Readout label="Plan">{hud.phase}</Readout>
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

export default TrafficSignalIntersection;
