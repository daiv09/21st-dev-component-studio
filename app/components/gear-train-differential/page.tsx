"use client";

import React, { useState } from "react";
import { GearTrainDifferential } from "./gear-train-differential";

export default function Page() {
  const [omegaA, setOmegaA] = useState(1.2);
  const [omegaB, setOmegaB] = useState(0.6);
  const [showTeeth, setShowTeeth] = useState(true);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">
          Instrument · 08
        </div>
        <h1 className="text-2xl tracking-tight">Gear Train Differential</h1>
        <GearTrainDifferential omegaA={omegaA} omegaB={omegaB} showTeeth={showTeeth} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">
          Controls HUD
        </div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between">
            <span>ω A</span>
            <span className="text-neutral-200">{omegaA.toFixed(2)}</span>
          </span>
          <input type="range" min={-2} max={2} step={0.05} value={omegaA} onChange={(e) => setOmegaA(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between">
            <span>ω B</span>
            <span className="text-neutral-200">{omegaB.toFixed(2)}</span>
          </span>
          <input type="range" min={-2} max={2} step={0.05} value={omegaB} onChange={(e) => setOmegaB(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button
          type="button"
          onClick={() => setShowTeeth((s) => !s)}
          className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-neutral-700"
        >
          Teeth {showTeeth ? "ON" : "OFF"}
        </button>
        <p className="text-[10px] text-neutral-500">ωc = (ωA+ωB)/2 · Equal speeds → spider locks.</p>
      </aside>
    </main>
  );
}
