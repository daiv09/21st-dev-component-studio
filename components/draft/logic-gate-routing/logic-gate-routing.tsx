"use client";

/**
 * Logic Gate Routing Yard — a live combinational lattice wired elbow-style
 * across the stage. Signal edges travel as physical pulses down each wire
 * with length-proportional delay, and every gate (AND/OR/XOR/NOT) only
 * re-fires when a new edge lands on an input pin. CLICK any gate to cycle
 * its species and watch the wavefront re-route; CLICK the toggle pads to
 * drive the inputs; the CLK pad free-runs so the yard never sits dead.
 * WHEEL retimes propagation velocity.
 */

import React, { useEffect, useRef, useState } from "react";

type Species = "AND" | "OR" | "XOR" | "NOT";

interface GNode {
  id: number;
  kind: "PAD" | "GATE" | "LAMP" | "CLK";
  species: Species;
  fx: number; // fractional layout coords
  fy: number;
  state: boolean;
  inWires: number[]; // wire indices feeding this node
}

interface Wire {
  from: number;
  to: number;
  delay: number; // seconds
  pulses: { born: number; val: boolean }[];
  lastVal: boolean;
}

export function LogicGateRouting() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    now: 0,
    speed: 1,
    nodes: [] as GNode[],
    wires: [] as Wire[],
    evalCount: 0,
    highWires: 0,
    hoverId: -1,
    clkTimer: 0,
  });

  const [hud, setHud] = useState({ evals: 0, high: 0, clk: false });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;

    // ---- build the netlist ------------------------------------------------
    const N = (
      kind: GNode["kind"],
      fx: number,
      fy: number,
      species: Species = "AND",
    ): number => {
      s.nodes.push({
        id: s.nodes.length,
        kind,
        fx,
        fy,
        species,
        state: false,
        inWires: [],
      });
      return s.nodes.length - 1;
    };
    const W = (from: number, to: number): void => {
      const a = s.nodes[from];
      const b = s.nodes[to];
      const len = Math.hypot(a.fx - b.fx, a.fy - b.fy);
      s.wires.push({ from, to, delay: 0.16 + len * 0.34, pulses: [], lastVal: false });
      b.inWires.push(s.wires.length - 1);
    };

    const padA = N("PAD", 0.08, 0.22);
    const padB = N("PAD", 0.08, 0.42);
    const padC = N("PAD", 0.08, 0.62);
    const padD = N("PAD", 0.08, 0.82);
    const clk = N("CLK", 0.08, 0.06);

    const gXor1 = N("GATE", 0.32, 0.32, "XOR"); // A ⊕ B
    const gOr1 = N("GATE", 0.32, 0.72, "OR"); // C ∨ D
    const gNot1 = N("GATE", 0.32, 0.10, "NOT"); // ¬B
    const gAnd1 = N("GATE", 0.56, 0.52, "AND"); // xor ∧ or
    const gXor2 = N("GATE", 0.56, 0.14, "XOR"); // notB ⊕ clk
    const gOr2 = N("GATE", 0.78, 0.33, "OR"); // final mix

    const lamp1 = N("LAMP", 0.93, 0.52);
    const lamp2 = N("LAMP", 0.93, 0.14);

    W(padA, gXor1);
    W(padB, gXor1);
    W(padC, gOr1);
    W(padD, gOr1);
    W(padB, gNot1);
    W(gXor1, gAnd1);
    W(gOr1, gAnd1);
    W(gNot1, gXor2);
    W(clk, gXor2);
    W(gAnd1, gOr2);
    W(gXor2, gOr2);
    W(gOr2, lamp1);
    W(gXor2, lamp2);

    s.nodes[padA].state = true;
    s.nodes[padD].state = true;

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
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // ---- event-driven evaluation -------------------------------------------
    const posOf = (n: GNode) => ({ x: n.fx * s.w, y: n.fy * s.h });

    const fire = (nodeId: number, val: boolean) => {
      const nd = s.nodes[nodeId];
      if (nd.state === val && nd.kind !== "PAD") return;
      nd.state = val;
      for (let wi = 0; wi < s.wires.length; wi++) {
        if (s.wires[wi].from !== nodeId) continue;
        const wr = s.wires[wi];
        wr.pulses.push({ born: s.now, val });
        if (wr.pulses.length > 6) wr.pulses.shift();
      }
    };

    const evalGate = (nd: GNode) => {
      const vals = nd.inWires.map((wi) => {
        const wr = s.wires[wi];
        return wr.lastVal;
      });
      let out: boolean;
      switch (nd.species) {
        case "AND":
          out = vals.length > 0 && vals.every(Boolean);
          break;
        case "OR":
          out = vals.some(Boolean);
          break;
        case "XOR":
          out = vals.filter(Boolean).length % 2 === 1;
          break;
        case "NOT":
          out = !vals[0];
          break;
      }
      if (out !== nd.state) {
        s.evalCount++;
        fire(nd.id, out);
      }
    };

    const deliver = (wi: number, val: boolean) => {
      const wr = s.wires[wi];
      if (wr.lastVal === val) return;
      wr.lastVal = val;
      const target = s.nodes[wr.to];
      if (target.kind === "GATE") evalGate(target);
      else if (target.kind === "LAMP") target.state = val;
    };

    // prime the network deterministically
    s.now = 0;
    fire(padA, true);
    fire(padD, true);

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const drawGlyph = (nd: GNode, x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#e7e5e4";
      ctx.fillStyle = "#17150f";
      if (nd.species === "AND") {
        ctx.beginPath();
        ctx.moveTo(-18, -13);
        ctx.lineTo(0, -13);
        ctx.arc(0, 0, 13, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(-18, 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (nd.species === "OR") {
        ctx.beginPath();
        ctx.moveTo(-18, -13);
        ctx.quadraticCurveTo(4, -13, 16, 0);
        ctx.quadraticCurveTo(4, 13, -18, 13);
        ctx.quadraticCurveTo(-10, 0, -18, -13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (nd.species === "XOR") {
        ctx.beginPath();
        ctx.moveTo(-13, -13);
        ctx.quadraticCurveTo(9, -13, 21, 0);
        ctx.quadraticCurveTo(9, 13, -13, 13);
        ctx.quadraticCurveTo(-5, 0, -13, -13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-19, -13);
        ctx.quadraticCurveTo(-11, 0, -19, 13);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(-14, -13);
        ctx.lineTo(12, 0);
        ctx.lineTo(-14, 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(15, 0, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(168,162,158,0.85)";
      ctx.fillText(nd.species, x, y + 26);
    };

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.05);
      last = nowMs;
      s.now += dt;

      // free-running clock pad
      s.clkTimer += dt;
      if (s.clkTimer > 1.1) {
        s.clkTimer = 0;
        const c = s.nodes.find((n) => n.kind === "CLK");
        if (c) fire(c.id, !c.state);
      }

      // advance pulses
      for (let wi = 0; wi < s.wires.length; wi++) {
        const wr = s.wires[wi];
        for (let i = wr.pulses.length - 1; i >= 0; i--) {
          if (s.now - wr.pulses[i].born >= wr.delay / s.speed) {
            const arrived = wr.pulses.splice(i, 1)[0];
            deliver(wi, arrived.val);
          }
        }
      }

      ctx.fillStyle = "#0d0f0c";
      ctx.fillRect(0, 0, s.w, s.h);

      // ---- wires ------------------------------------------------------------
      let highCount = 0;
      for (let wi = 0; wi < s.wires.length; wi++) {
        const wr = s.wires[wi];
        if (wr.lastVal) highCount++;
        const a = posOf(s.nodes[wr.from]);
        const b = posOf(s.nodes[wr.to]);
        const mx = (a.x + b.x) / 2;
        ctx.strokeStyle = wr.lastVal ? "rgba(163,230,53,0.75)" : "rgba(87,83,78,0.65)";
        ctx.lineWidth = wr.lastVal ? 2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mx, a.y);
        ctx.lineTo(mx, b.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // travelling pulses
        for (const pl of wr.pulses) {
          const p = Math.min(1, ((s.now - pl.born) * s.speed) / wr.delay);
          // piecewise position along the elbow
          const segLens = [mx - a.x, Math.abs(b.y - a.y), b.x - mx];
          const total = segLens[0] + segLens[1] + segLens[2] || 1;
          let rem = p * total;
          let px = a.x;
          let py = a.y;
          if (rem <= segLens[0]) {
            px = a.x + rem;
          } else {
            px = mx;
            rem -= segLens[0];
            if (rem <= segLens[1]) {
              py = a.y + Math.sign(b.y - a.y) * rem;
            } else {
              py = b.y;
              rem -= segLens[1];
              px = mx + rem;
            }
          }
          ctx.beginPath();
          ctx.arc(px, py, 5.4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(163,230,53,0.28)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = "#faffef";
          ctx.fill();
        }
      }
      s.highWires = highCount;

      // ---- junction dots -------------------------------------------------------
      for (const nd of s.nodes) {
        const p = posOf(nd);
        if (nd.kind === "PAD" || nd.kind === "CLK") {
          const sz = 15;
          ctx.fillStyle = nd.state ? "#a3e635" : "#1c1917";
          ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
          ctx.strokeStyle = nd.kind === "CLK" ? "#fbbf24" : "#d6d3d1";
          ctx.lineWidth = 1.6;
          ctx.strokeRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
          ctx.font = "8px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(168,162,158,0.85)";
          ctx.fillText(nd.kind === "CLK" ? "CLK" : nd.id.toString(), p.x, p.y + 24);
        } else if (nd.kind === "GATE") {
          drawGlyph(nd, p.x, p.y);
          if (s.hoverId === nd.id) {
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 1.4;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(p.x - 26, p.y - 20, 52, 40);
            ctx.setLineDash([]);
          }
        } else {
          // LAMP
          const R = 11;
          ctx.beginPath();
          ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
          ctx.fillStyle = nd.state ? "#fbbf24" : "#1c1917";
          ctx.fill();
          ctx.strokeStyle = "#d6d3d1";
          ctx.lineWidth = 1.8;
          ctx.stroke();
          if (nd.state) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, R * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = "#fffbeb";
            ctx.fill();
          }
        }
      }

      hudAcc += dt;
      if (hudAcc > 0.3) {
        hudAcc = 0;
        const clkN = s.nodes.find((n) => n.kind === "CLK");
        setHud({ evals: s.evalCount, high: s.highWires, clk: !!clkN?.state });
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const hitTest = (mx: number, my: number): number => {
    const s = sim.current;
    for (const nd of s.nodes) {
      const x = nd.fx * s.w;
      const y = nd.fy * s.h;
      if (nd.kind === "GATE" && Math.abs(x - mx) < 26 && Math.abs(y - my) < 22) return nd.id;
      if ((nd.kind === "PAD" || nd.kind === "CLK") && Math.abs(x - mx) < 14 && Math.abs(y - my) < 14)
        return nd.id;
    }
    return -1;
  };

  const onClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (id < 0) return;
    const s = sim.current;
    const nd = s.nodes[id];
    if (nd.kind === "PAD") {
      nd.state = !nd.state;
      for (const wi of s.wires.keys()) {
        if (s.wires[wi].from === id) s.wires[wi].pulses.push({ born: s.now, val: nd.state });
      }
    } else if (nd.kind === "GATE") {
      const order: Species[] = ["AND", "OR", "XOR", "NOT"];
      nd.species = order[(order.indexOf(nd.species) + 1) % order.length];
      // re-evaluate immediately from current wire states
      const vals = nd.inWires.map((wi) => s.wires[wi].lastVal);
      let out: boolean;
      switch (nd.species) {
        case "AND": out = vals.every(Boolean); break;
        case "OR": out = vals.some(Boolean); break;
        case "XOR": out = vals.filter(Boolean).length % 2 === 1; break;
        case "NOT": out = !vals[0]; break;
      }
      if (out !== nd.state) {
        s.evalCount++;
        nd.state = out;
        for (const wi of s.wires.keys()) {
          if (s.wires[wi].from === id) s.wires[wi].pulses.push({ born: s.now, val: out });
        }
      }
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sp = sim.current.speed;
      sim.current.speed = Math.max(0.35, Math.min(3.4, sp * (e.deltaY < 0 ? 1.12 : 0.8929)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={wrapRef}
      onClick={onClick}
      className="relative h-screen w-full overflow-hidden bg-[#0d0f0c] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-pointer" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-lime-300 uppercase">
          Logic Gate Yard
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Delay-Routed Combinational Lattice
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Click Pads — Drive Inputs
          <br />
          Click Gates — Cycle Species · Wheel — Propagation Speed
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Evals">{hud.evals}</Readout>
        <Readout label="Hot Wires">{hud.high}</Readout>
        <Readout label="Clock">{hud.clk ? "HIGH" : "LOW"}</Readout>
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

export default LogicGateRouting;
