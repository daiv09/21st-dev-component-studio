"use client";

/**
 * Wind Farm Dispatch — a ridge line of turbines harvesting a wind field
 * you steer. The pointer aims the wind vector; WHEEL sets its speed.
 * Each rotor's power follows the cube law on the component of wind along
 * its nacelle heading (turbines yaw lazily toward the flow), wakes shed
 * downstream as stepped-tone streaks, and the farm's summed megawatts
 * stream into a live dispatch meter. CLICK a turbine to lock/unlock it
 * for maintenance — the grid total responds instantly.
 */

import React, { useEffect, useRef, useState } from "react";

interface Turbine {
  x: number;
  y: number;
  heading: number; // current nacelle angle (rad)
  omega: number; // blade angular velocity
  blade: number;
  locked: boolean;
  power: number; // MW
}

const N = 9;

export function WindTurbineFarm() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    t: 0,
    windAng: -0.35,
    targetWindAng: -0.35,
    windSpd: 11, // m/s
    targetWindSpd: 11,
    gustT: 0,
    turbines: [] as Turbine[],
    wakeSeeds: [] as { x: number; y: number; vx: number; vy: number; life: number; from: number }[],
    pointerX: -9999,
    pointerY: -9999,
    totalMw: 0,
  });

  const [hud, setHud] = useState({ mw: 0, spd: 11, dir: "NW", locked: 0 });

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
      if (s.turbines.length === 0) {
        // two staggered rows along the valley floor
        for (let i = 0; i < N; i++) {
          const row = i % 2;
          s.turbines.push({
            x: rect.width * (0.12 + 0.19 * Math.floor(i / 2)) + (row ? 40 : 0),
            y: rect.height * (row ? 0.66 : 0.44) + (i % 4) * 6,
            heading: -0.35 + Math.PI,
            omega: 0,
            blade: Math.random() * Math.PI * 2,
            locked: false,
            power: 0,
          });
        }
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

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const drawTurbine = (tb: Turbine, groundY: number) => {
      // tower
      ctx.strokeStyle = "#d6d3d1";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tb.x, groundY);
      ctx.lineTo(tb.x, tb.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tb.x - 1, groundY);
      ctx.lineTo(tb.x - 1, tb.y);
      ctx.stroke();

      // nacelle
      ctx.save();
      ctx.translate(tb.x, tb.y);
      ctx.rotate(tb.heading);
      ctx.fillStyle = "#e7e5e4";
      ctx.fillRect(-8, -5, 22, 10);
      ctx.fillStyle = "#a8a29e";
      ctx.fillRect(-8, 3, 22, 2);

      // blades
      ctx.rotate(tb.blade);
      ctx.fillStyle = tb.locked ? "#78716c" : "#fafaf9";
      for (let b = 0; b < 3; b++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, -2.6);
        ctx.quadraticCurveTo(34, -4.4, 52, -0.6);
        ctx.quadraticCurveTo(30, 2.2, 0, 2.6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // hub cap
      ctx.beginPath();
      ctx.arc(tb.x, tb.y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = tb.locked ? "#ef4444" : "#f59e0b";
      ctx.fill();
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      s.t += dt;
      s.gustT += dt;

      // eased wind toward pointer-aimed targets + gust noise
      s.windAng += (s.targetWindAng - s.windAng) * Math.min(1, dt * 2.4);
      s.windSpd += (s.targetWindSpd - s.windSpd) * Math.min(1, dt * 2.2);
      const gust =
        1 +
        0.14 * Math.sin(s.gustT * 0.9) +
        0.08 * Math.sin(s.gustT * 2.7 + 1.3) +
        0.05 * Math.sin(s.gustT * 5.1);
      const effSpd = s.windSpd * gust;
      const wx = Math.cos(s.windAng);
      const wy = Math.sin(s.windAng);

      // pointer aim (when over stage)
      if (s.pointerX > -999) {
        const dx = s.pointerX - s.w / 2;
        const dy = s.pointerY - s.h / 2;
        if (Math.hypot(dx, dy) > 60) s.targetWindAng = Math.atan2(dy, dx);
      }

      ctx.fillStyle = "#101210";
      ctx.fillRect(0, 0, s.w, s.h);

      // ---- terrain silhouette ---------------------------------------------
      const horizon = s.h * 0.78;
      ctx.fillStyle = "#181b17";
      ctx.beginPath();
      ctx.moveTo(0, s.h);
      for (let x = 0; x <= s.w; x += 24) {
        const yy =
          horizon -
          26 * Math.sin(x * 0.004 + 1.2) -
          18 * Math.sin(x * 0.011 + 0.4) -
          10 * Math.sin(x * 0.023);
        ctx.lineTo(x, yy);
      }
      ctx.lineTo(s.w, s.h);
      ctx.closePath();
      ctx.fill();
      // second nearer ridge
      ctx.fillStyle = "#12140f";
      ctx.beginPath();
      ctx.moveTo(0, s.h);
      for (let x = 0; x <= s.w; x += 20) {
        const yy =
          horizon + 42 - 20 * Math.sin(x * 0.006 + 3) - 12 * Math.sin(x * 0.015 + 2);
        ctx.lineTo(x, yy);
      }
      ctx.lineTo(s.w, s.h);
      ctx.closePath();
      ctx.fill();

      // ---- flow field streaks ----------------------------------------------
      ctx.lineWidth = 1.2;
      const STREAKS = 26;
      for (let i = 0; i < STREAKS; i++) {
        const seedA = i * 2.399963; // golden-angle scatter
        let px = ((seedA * 137.5 + s.t * wx * effSpd * 9) % (s.w + 160)) - 80;
        let py = ((seedA * 89.3 + s.t * wy * effSpd * 9) % (s.h + 120)) - 60;
        if (px < -80) px += s.w + 160;
        if (py < -60) py += s.h + 120;
        const len = 10 + effSpd * 2.2;
        const depth = py / s.h; // farther up = fainter
        ctx.strokeStyle = `rgba(163,163,90,${0.05 + depth * 0.16})`;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + wx * len, py + wy * len);
        ctx.stroke();
      }

      // ---- turbines physics --------------------------------------------------
      let sum = 0;
      let lockedCount = 0;
      s.turbines.forEach((tb, ti) => {
        if (!tb.locked) {
          // yaw lazily toward wind direction (nacelle points INTO the wind)
          const want = s.windAng + Math.PI;
          let diff = want - tb.heading;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          tb.heading += diff * Math.min(1, dt * 1.6);

          // tip-speed ratio → rotor ω from axial wind component
          const ax = -(wx * Math.cos(tb.heading) + wy * Math.sin(tb.heading)); // headwind on rotor
          const axial = Math.max(0.05, ax);
          const targetOmega = axial * effSpd * 0.09;
          tb.omega += (targetOmega - tb.omega) * Math.min(1, dt * 1.4);
          tb.blade += tb.omega * dt;

          // cube-law power with wake deficit: any unlocked turbine upstream within cone steals momentum
          let deficit = 1;
          s.turbines.forEach((other, oj) => {
            if (oj === ti || other.locked) return;
            const dx = tb.x - other.x;
            const dy = tb.y - other.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 340 || dist < 1) return;
            const align = (dx / dist) * wx + (dy / dist) * wy; // other is upwind?
            if (align > 0.86) deficit *= Math.max(0.45, 1 - (1 - dist / 340) * 0.55 * align);
          });
          tb.power = Math.round(Math.pow(axial * effSpd / 12, 3) * 3.6 * deficit * 10) / 10;
        } else {
          lockedCount++;
          tb.power *= 1 - Math.min(1, dt * 6); // spool down
          tb.blade += tb.omega * dt;
          tb.omega *= 1 - Math.min(1, dt * 2.5);
        }
        sum += tb.power;
      });
      s.totalMw += (sum - s.totalMw) * Math.min(1, dt * 4);

      // ---- wake particles -----------------------------------------------------
      for (const tb of s.turbines) {
        if (tb.locked || tb.omega < 0.5) continue;
        if (Math.random() < 0.5) {
          const back = tb.heading + Math.PI;
          s.wakeSeeds.push({
            x: tb.x + Math.cos(back) * 46,
            y: tb.y + Math.sin(back) * 46,
            vx: Math.cos(back) * (30 + tb.omega * 24),
            vy: Math.sin(back) * (30 + tb.omega * 24) + 6,
            life: 1,
            from: 0,
          });
        }
      }
      ctx.lineWidth = 1.6;
      for (let i = s.wakeSeeds.length - 1; i >= 0; i--) {
        const wk = s.wakeSeeds[i];
        wk.x += wk.vx * dt;
        wk.y += wk.vy * dt;
        wk.life -= dt * 0.55;
        if (wk.life <= 0) {
          s.wakeSeeds.splice(i, 1);
          continue;
        }
        const tone = wk.life > 0.66 ? "rgba(212,162,78,0.4)" : wk.life > 0.33 ? "rgba(180,83,9,0.32)" : "rgba(120,53,15,0.25)";
        ctx.strokeStyle = tone;
        ctx.beginPath();
        ctx.moveTo(wk.x, wk.y);
        ctx.lineTo(wk.x - wk.vx * 0.08, wk.y - wk.vy * 0.08);
        ctx.stroke();
      }
      if (s.wakeSeeds.length > 260) s.wakeSeeds.splice(0, s.wakeSeeds.length - 260);

      // ---- draw turbines far→near --------------------------------------------
      const order = s.turbines.map((tb, i) => i).sort((a, b) => s.turbines[a].y - s.turbines[b].y);
      for (const i of order) {
        const tb = s.turbines[i];
        drawTurbine(tb, tb.y + 64);
        // power flag
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = tb.locked ? "#ef4444" : "#a3e635";
        ctx.fillText(
          tb.locked ? "MAINT" : `${tb.power.toFixed(1)}MW`,
          tb.x,
          tb.y - 62,
        );
      }

      // ---- wind vane dial -------------------------------------------------------
      const vx = 92;
      const vy = s.h - 96;
      ctx.strokeStyle = "rgba(212,162,78,0.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(vx, vy, 34, 0, Math.PI * 2);
      ctx.stroke();
      for (let c = 0; c < 8; c++) {
        const a = (c * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(vx + Math.cos(a) * 28, vy + Math.sin(a) * 28);
        ctx.lineTo(vx + Math.cos(a) * 34, vy + Math.sin(a) * 34);
        ctx.stroke();
      }
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vx - Math.cos(s.windAng) * 26, vy - Math.sin(s.windAng) * 26);
      ctx.lineTo(vx + Math.cos(s.windAng) * 26, vy + Math.sin(s.windAng) * 26);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(vx + Math.cos(s.windAng) * 26, vy + Math.sin(s.windAng) * 26, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();

      // ---- dispatch meter ---------------------------------------------------------
      const mx = s.w - 200;
      const my = s.h - 84;
      const MW_MAX = 36;
      const frac = Math.max(0, Math.min(1, s.totalMw / MW_MAX));
      const SEG = 24;
      for (let g = 0; g < SEG; g++) {
        const on = g / SEG < frac;
        ctx.fillStyle = on
          ? g > SEG * 0.75
            ? "#ef4444"
            : g > SEG * 0.45
              ? "#fbbf24"
              : "#a3e635"
          : "rgba(255,255,255,0.07)";
        ctx.fillRect(mx + g * 8, my, 5.4, 26);
      }
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(168,162,158,0.9)";
      ctx.fillText("GRID DISPATCH", mx, my - 8);

      hudAcc += dt;
      if (hudAcc > 0.25) {
        hudAcc = 0;
        const deg = (((s.windAng * 180) / Math.PI) % 360 + 360) % 360;
        const dirs = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
        setHud({
          mw: Math.round(s.totalMw * 10) / 10,
          spd: Math.round(effSpd * 10) / 10,
          dir: dirs[Math.round(deg / 45) % 8],
          locked: lockedCount,
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

  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    sim.current.pointerX = e.clientX - rect.left;
    sim.current.pointerY = e.clientY - rect.top;
  };

  const onLeave = () => {
    sim.current.pointerX = -9999;
    sim.current.pointerY = -9999;
  };

  const onClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let hit = -1;
    let bestD = 34;
    sim.current.turbines.forEach((tb, i) => {
      const d = Math.hypot(tb.x - mx, (tb.y + 30) - my);
      if (d < bestD) {
        bestD = d;
        hit = i;
      }
    });
    if (hit >= 0) sim.current.turbines[hit].locked = !sim.current.turbines[hit].locked;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.targetWindSpd = Math.max(2, Math.min(26, s.targetWindSpd + (e.deltaY < 0 ? 0.8 : -0.8)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
      className="relative h-screen w-full overflow-hidden bg-[#101210] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-lime-300 uppercase">
          Wind Farm Dispatch
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Cube-Law Harvest · Wake Deficit Model
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Pointer — Aim Wind · Wheel — Speed {hud.spd} m/s
          <br />
          Click Turbine — Maintenance Lock
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Output">{hud.mw.toFixed(1)} MW</Readout>
        <Readout label="Flow">{hud.dir} · {hud.spd} m/s</Readout>
        <Readout label="Offline">{hud.locked}</Readout>
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

export default WindTurbineFarm;
