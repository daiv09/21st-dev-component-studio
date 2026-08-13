"use client";

import React, { useState } from "react";
import { CableStayedBridge } from "./cable-stayed-bridge";

export default function Page() {
  const [load, setLoad] = useState(0.6);
  const [sag, setSag] = useState(28);
  const [stays, setStays] = useState(7);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 19</div>
        <h1 className="text-2xl tracking-tight">Cable-Stayed Bridge</h1>
        <CableStayedBridge load={load} sag={sag} stays={stays} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Load</span><span>{load.toFixed(2)}</span></span>
          <input type="range" min={0} max={1.5} step={0.05} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Sag</span><span>{sag}</span></span>
          <input type="range" min={8} max={60} step={1} value={sag} onChange={(e) => setSag(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Stays</span><span>{stays}</span></span>
          <input type="range" min={3} max={12} step={1} value={stays} onChange={(e) => setStays(Number(e.target.value))} className="accent-neutral-200" />
        </label>
      </aside>
    </main>
  );
}
