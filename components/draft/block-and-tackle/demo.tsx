"use client";

import React, { useState } from "react";
import { BlockAndTackle } from "./block-and-tackle";

export default function Page() {
  const [parts, setParts] = useState(4);
  const [load, setLoad] = useState(0.7);
  const [haul, setHaul] = useState(0.4);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 20</div>
        <h1 className="text-2xl tracking-tight">Block and Tackle</h1>
        <BlockAndTackle parts={parts} load={load} haul={haul} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Parts (MA)</span><span>{parts}</span></span>
          <input type="range" min={2} max={8} step={1} value={parts} onChange={(e) => setParts(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Load</span><span>{load.toFixed(2)}</span></span>
          <input type="range" min={0.2} max={1.5} step={0.05} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Haul</span><span>{haul.toFixed(2)}</span></span>
          <input type="range" min={0} max={1} step={0.01} value={haul} onChange={(e) => setHaul(Number(e.target.value))} className="accent-neutral-200" />
        </label>
      </aside>
    </main>
  );
}
