"use client";

import React, { useState } from "react";
import { FoucaultPendulum } from "./foucault-pendulum";

export default function Page() {
  const [latitude, setLatitude] = useState(48.8);
  const [period, setPeriod] = useState(4.5);
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 10</div>
        <h1 className="text-2xl tracking-tight">Foucault Pendulum</h1>
        <FoucaultPendulum key={key} latitude={latitude} period={period} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Latitude°</span><span>{latitude.toFixed(1)}</span></span>
          <input type="range" min={-90} max={90} step={0.5} value={latitude} onChange={(e) => setLatitude(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Period s</span><span>{period.toFixed(1)}</span></span>
          <input type="range" min={2} max={8} step={0.1} value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button type="button" onClick={() => setKey((k) => k + 1)} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">Clear Trail</button>
        <p className="text-[10px] text-neutral-500">At equator (φ=0) precession vanishes. Poles: full −ω.</p>
      </aside>
    </main>
  );
}
