"use client";

/**
 * Packet Topology Fabric — a force-directed mesh that keeps relaxing under
 * spring tension while shipping directed packet bursts. Packets route
 * greedily hop-to-hop toward their destination, QUEUE inside congested
 * routers (which flush hot red until drained), and flash their receiver on
 * delivery. CLICK any router to inject a traffic surge from it; WHEEL
 * retunes global traffic pressure; DRAG any node to rewire the geometry.
 */

import React, { useEffect, useRef, useState } from "react";

interface RNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned: boolean;
  queue: { target: number }[];
  heat: number; // congestion heat 0..1
  flash: number; // delivery flash timer
  drainT: number;
}

interface Link {
  a: number;
  b: number;
  rest: number;
}

interface Packet {
  edge: number; // link index currently traversing
  dir: 1 | -1; // a→b or b→a
  t: number; // 0..1
  speed: number;
  target: number;
  trail: number;
}

const N_NODES = 15;

export function NetworkPacketTopology() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    nodes: [] as RNode[],
    links: [] as Link[],
    adj: [] as number[][], // node -> link indices
    packets: [] as Packet[],
    pressure: 1,
    spawnAcc: 0,
    delivered: 0,
    lost: 0,
    dragId: -1,
  });

  const [hud, setHud] = useState({ flight: 0, ok: 0, hot: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;

    // ---- build topology ----------------------------------------------------
    for (let i = 0; i < N_NODES; i++) {
      const ang = (i / N_NODES) * Math.PI * 2;
      const rr = 120 + (i % 3) * 55;
      s.nodes.push({
        id: i,
        x: 400 + Math.cos(ang) * rr,
        y: 300 + Math.sin(ang) * rr,
        vx: 0,
        vy: 0,
        pinned: false,
        queue: [],
        heat: 0,
        flash: 0,
        drainT: 0,
      });
    }
    const linkUp = (a: number, b: number) => {
      s.links.push({ a, b, rest: 150 });
      const li = s.links.length - 1;
      s.adj[a].push(li);
      s.adj[b].push(li);
    };
    s.adj = s.nodes.map(() => []);
    // ring + chords + cross-links
    for (let i = 0; i < N_NODES; i++) linkUp(i, (i + 1) % N_NODES);
    linkUp(0, 5); linkUp(2, 8); linkUp(3, 11);
    linkUp(6, 12); linkUp(9, 14); linkUp(1, 7); linkUp(4, 10);

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

    const spawnPacketFrom = (src: number): void => {
      let dst = Math.floor(Math.random() * N_NODES);
      if (dst === src) dst = (dst + 3) % N_NODES;
      const adjL = s.adj[src];
      if (!adjL.length) return;
      const li = adjL[Math.floor(Math.random() * adjL.length)];
      const lk = s.links[li];
      const dir: 1 | -1 = lk.a === src ? 1 : -1;
      s.packets.push({
        edge: li,
        dir,
        t: 0,
        speed: 0.9 + Math.random() * 0.5,
        target: dst,
        trail: 0,
      });
    };

    const arriveAtNode = (pk: Packet, nodeId: number): void => {
      const nd = s.nodes[nodeId];
      if (nodeId === pk.target) {
        s.delivered++;
        nd.flash = 1;
        return;
      }
      if (nd.queue.length >= 7) {
        s.lost++; // buffer overflow
        return;
      }
      nd.queue.push({ target: pk.target });
    };

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.05);
      last = nowMs;

      // ---- layout forces ------------------------------------------------------
      const REP = 26000;
      for (let i = 0; i < s.nodes.length; i++) {
        const a = s.nodes[i];
        for (let j = i + 1; j < s.nodes.length; j++) {
          const b = s.nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy + 60;
          const f = REP / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx * dt;
          a.vy += fy * dt;
          b.vx -= fx * dt;
          b.vy -= fy * dt;
        }
      }
      for (const lk of s.links) {
        const a = s.nodes[lk.a];
        const b = s.nodes[lk.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - lk.rest) * 2.4;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx * dt;
        a.vy += fy * dt;
        b.vx -= fx * dt;
        b.vy -= fy * dt;
      }
      for (const nd of s.nodes) {
        // gentle centre pull
        nd.vx += (s.w / 2 - nd.x) * 0.22 * dt;
        nd.vy += (s.h / 2 - nd.y) * 0.22 * dt;
        if (nd.id !== s.dragId && !nd.pinned) {
          nd.x += nd.vx * dt;
          nd.y += nd.vy * dt;
        }
        nd.vx *= 1 - Math.min(1, dt * 3.4);
        nd.vy *= 1 - Math.min(1, dt * 3.4);
        nd.heat += ((nd.queue.length >= 4 ? 1 : 0) - nd.heat) * Math.min(1, dt * 3);
        nd.flash = Math.max(0, nd.flash - dt * 2.4);
        nd.x = Math.max(40, Math.min(s.w - 40, nd.x));
        nd.y = Math.max(70, Math.min(s.h - 90, nd.y));
      }

      // ---- traffic -------------------------------------------------------------
      s.spawnAcc += dt * s.pressure;
      while (s.spawnAcc > 0.5) {
        s.spawnAcc -= 0.5;
        spawnPacketFrom(Math.floor(Math.random() * N_NODES));
      }

      // routers drain queues at a rate; congested routers drain slower
      for (const nd of s.nodes) {
        nd.drainT = (nd.drainT ?? 0) + dt;
        const rate = nd.queue.length >= 4 ? 0.42 : 0.2;
        while (nd.drainT > rate && nd.queue.length) {
          nd.drainT -= rate;
          const job = nd.queue.shift()!;
          // greedy next hop: neighbour minimising straight-line distance to target
          let bestLi = -1;
          let bestNext = -1;
          let bestD = Infinity;
          for (const li of s.adj[nd.id]) {
            const lk = s.links[li];
            const other = lk.a === nd.id ? lk.b : lk.a;
            const dOther = Math.hypot(
              s.nodes[other].x - s.nodes[job.target].x,
              s.nodes[other].y - s.nodes[job.target].y,
            );
            if (dOther < bestD) {
              bestD = dOther;
              bestLi = li;
              bestNext = other;
            }
          }
          if (bestLi < 0) continue;
          const lk = s.links[bestLi];
          s.packets.push({
            edge: bestLi,
            dir: lk.a === nd.id ? 1 : -1,
            t: 0,
            speed: 0.85 + Math.random() * 0.5,
            target: job.target,
            trail: 0,
          });
          void bestNext;
        }
      }

      // advance packets
      for (let i = s.packets.length - 1; i >= 0; i--) {
        const pk = s.packets[i];
        pk.t += pk.speed * dt;
        pk.trail = Math.min(1, pk.trail + dt * 3);
        if (pk.t >= 1) {
          const lk = s.links[pk.edge];
          const arrived = pk.dir === 1 ? lk.b : lk.a;
          s.packets.splice(i, 1);
          arriveAtNode(pk, arrived);
        }
      }

      // ---- draw ------------------------------------------------------------------
      ctx.fillStyle = "#0b0e0c";
      ctx.fillRect(0, 0, s.w, s.h);

      // links (tone by load)
      for (let li = 0; li < s.links.length; li++) {
        const lk = s.links[li];
        const a = s.nodes[lk.a];
        const b = s.nodes[lk.b];
        let load = 0;
        for (const p of s.packets) if (p.edge === li) load++;
        ctx.strokeStyle = load > 1 ? "rgba(212,162,78,0.65)" : "rgba(87,83,78,0.5)";
        ctx.lineWidth = load > 1 ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // packets — hard lime dots with fading tail slice
      for (const pk of s.packets) {
        const lk = s.links[pk.edge];
        const ax = pk.dir === 1 ? lk.a : lk.b;
        const bx = pk.dir === 1 ? lk.b : lk.a;
        const A = s.nodes[ax];
        const B = s.nodes[bx];
        const px = A.x + (B.x - A.x) * pk.t;
        const py = A.y + (B.y - A.y) * pk.t;
        const tx = A.x + (B.x - A.x) * Math.max(0, pk.t - 0.09);
        const ty = A.y + (B.y - A.y) * Math.max(0, pk.t - 0.09);
        ctx.strokeStyle = "rgba(163,230,53,0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ecfccb";
        ctx.fill();
      }

      // routers
      for (const nd of s.nodes) {
        const q = nd.queue.length;
        const R = 13 + Math.min(6, q);
        // congestion halo — stepped red bands
        if (nd.heat > 0.05) {
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, R + 8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239,68,68,${0.25 + nd.heat * 0.4})`;
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, R, 0, Math.PI * 2);
        ctx.fillStyle = nd.heat > 0.5 ? "#7f1d1d" : nd.id % 3 === 0 ? "#065f46" : "#064e3b";
        ctx.fill();
        ctx.strokeStyle = nd.heat > 0.5 ? "#ef4444" : "#34d399";
        ctx.lineWidth = 1.8;
        ctx.stroke();
        // fill gauge showing queue depth
        ctx.fillStyle = nd.heat > 0.5 ? "#ef4444" : "#a7f3d0";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(q), nd.x, nd.y + 0.5);
        // delivery flash ring
        if (nd.flash > 0) {
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, R + 14 * (1 - nd.flash) + 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(250,250,249,${nd.flash})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      hudAcc += dt;
      if (hudAcc > 0.3) {
        hudAcc = 0;
        setHud({
          flight: s.packets.length,
          ok: s.delivered,
          hot: s.nodes.filter((n) => n.heat > 0.5).length,
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

  const pickNode = (mx: number, my: number): number => {
    const s = sim.current;
    let best = -1;
    let bestD = 24;
    for (const nd of s.nodes) {
      const d = Math.hypot(nd.x - mx, nd.y - my);
      if (d < bestD) {
        bestD = d;
        best = nd.id;
      }
    }
    return best;
  };

  const onDown = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = pickNode(mx, my);
    sim.current.dragId = hit;
    if (hit >= 0) e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.dragId < 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nd = s.nodes[s.dragId];
    nd.x = e.clientX - rect.left;
    nd.y = e.clientY - rect.top;
    nd.vx = 0;
    nd.vy = 0;
  };

  const onUp = () => {
    sim.current.dragId = -1;
  };

  const onClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hit = pickNode(e.clientX - rect.left, e.clientY - rect.top);
    if (hit < 0) return;
    const s = sim.current;
    // surge: burst of jobs queued directly at this router
    for (let i = 0; i < 6; i++) {
      let dst = Math.floor(Math.random() * s.nodes.length);
      if (dst === hit) dst = (dst + 4) % s.nodes.length;
      s.nodes[hit].queue.push({ target: dst });
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = sim.current.pressure;
      sim.current.pressure = Math.max(0.2, Math.min(6, p * (e.deltaY < 0 ? 1.13 : 0.885)));
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
      className="relative h-screen w-full overflow-hidden bg-[#0b0e0c] select-none touch-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-pointer" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-emerald-300 uppercase">
          Packet Topology Fabric
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Force-Directed Mesh · Greedy Hop Routing
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Click Router — Traffic Surge · Drag — Rewire Geometry
          <br />
          Wheel — Traffic Pressure
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="In Flight">{hud.flight}</Readout>
        <Readout label="Delivered">{hud.ok}</Readout>
        <Readout label="Congested">{hud.hot}</Readout>
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

export default NetworkPacketTopology;
