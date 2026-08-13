"use client";

import React, { useState } from "react";
import { BalanceBeamScale } from "./balance-beam-scale";

export default function Page() {
  const [massL, setMassL] = useState(1.0);
  const [massR, setMassR] = useState(1.05);
  const [damping, setDamping] = useState(0.55);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 30</div>
        <h1 className="text-2xl tracking-tight">Balance Beam Scale</h1>
        <BalanceBeamScale massL={massL} massR={massR} damping={damping} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Mass L</span><span>{massL.toFixed(2)}</span></span>
          <input type="range" min={0.2} max={2} step={0.01} value={massL} onChange={(e) => setMassL(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Mass R</span><span>{massR.toFixed(2)}</span></span>
          <input type="range" min={0.2} max={2} step={0.01} value={massR} onChange={(e) => setMassR(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Damping</span><span>{damping.toFixed(2)}</span></span>
          <input type="range" min={0.05} max={2} step={0.05} value={damping} onChange={(e) => setDamping(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button type="button" onClick={() => { setMassL(1); setMassR(1); }} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">
          Equalize
        </button>
      </aside>
    </main>
  );
}
