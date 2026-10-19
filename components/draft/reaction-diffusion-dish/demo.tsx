"use client";

import React, { useState } from "react";
import { ReactionDiffusionDish } from "./reaction-diffusion-dish";

export default function Page() {
  const [feed, setFeed] = useState(0.037);
  const [kill, setKill] = useState(0.06);
  const [running, setRunning] = useState(true);
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 14</div>
        <h1 className="text-2xl tracking-tight">Reaction Diffusion Dish</h1>
        <ReactionDiffusionDish key={key} feed={feed} kill={kill} running={running} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Feed f</span><span>{feed.toFixed(3)}</span></span>
          <input type="range" min={0.01} max={0.08} step={0.001} value={feed} onChange={(e) => setFeed(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Kill k</span><span>{kill.toFixed(3)}</span></span>
          <input type="range" min={0.04} max={0.07} step={0.001} value={kill} onChange={(e) => setKill(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setRunning((r) => !r)} className="flex-1 border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">
            {running ? "Pause" : "Run"}
          </button>
          <button type="button" onClick={() => setKey((k) => k + 1)} className="flex-1 border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">
            Reseed
          </button>
        </div>
      </aside>
    </main>
  );
}
