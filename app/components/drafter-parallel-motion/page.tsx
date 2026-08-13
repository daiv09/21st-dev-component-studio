"use client";

import React, { useState } from "react";
import { DrafterParallelMotion } from "./drafter-parallel-motion";

export default function Page() {
  const [key, setKey] = useState(0);
  const [headAngle, setHeadAngle] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 28</div>
        <h1 className="text-2xl tracking-tight">Drafter Parallel Motion</h1>
        <DrafterParallelMotion key={key} headAngle={headAngle} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Head°</span><span>{headAngle}</span></span>
          <input type="range" min={-45} max={45} step={1} value={headAngle} onChange={(e) => setHeadAngle(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          Drag the drafting head. Parallelogram arms keep the scales consistent under translation.
        </p>
        <button type="button" onClick={() => setKey((k) => k + 1)} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">
          Reset Head
        </button>
      </aside>
    </main>
  );
}
