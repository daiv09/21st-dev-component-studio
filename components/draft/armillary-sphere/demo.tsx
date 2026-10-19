"use client";

import React, { useState } from "react";
import { ArmillarySphere } from "./armillary-sphere";

export default function Page() {
  const [obliquity, setObliquity] = useState(23.4);
  const [spin, setSpin] = useState(0.4);
  const [pitch, setPitch] = useState(0.35);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 12</div>
        <h1 className="text-2xl tracking-tight">Armillary Sphere</h1>
        <ArmillarySphere obliquity={obliquity} spin={spin} pitch={pitch} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Obliquity ε°</span><span>{obliquity.toFixed(1)}</span></span>
          <input type="range" min={0} max={45} step={0.1} value={obliquity} onChange={(e) => setObliquity(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Spin</span><span>{spin.toFixed(2)}</span></span>
          <input type="range" min={0} max={1.5} step={0.05} value={spin} onChange={(e) => setSpin(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Pitch</span><span>{pitch.toFixed(2)}</span></span>
          <input type="range" min={-0.8} max={0.8} step={0.01} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <p className="text-[10px] text-neutral-500">Canvas projective rings — no Three.js in package.json.</p>
      </aside>
    </main>
  );
}
