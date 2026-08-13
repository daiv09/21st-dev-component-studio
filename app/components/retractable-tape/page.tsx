"use client";

import React, { useState } from "react";
import { RetractableTape } from "./retractable-tape";

export default function Page() {
  const [lengthCm, setLengthCm] = useState(80);
  const [springK, setSpringK] = useState(0.35);
  const [locked, setLocked] = useState(false);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 21</div>
        <h1 className="text-2xl tracking-tight">Retractable Tape</h1>
        <RetractableTape lengthCm={lengthCm} springK={springK} locked={locked} onLengthChange={setLengthCm} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Length cm</span><span>{lengthCm.toFixed(0)}</span></span>
          <input type="range" min={0} max={300} step={1} value={lengthCm} onChange={(e) => setLengthCm(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Spring k</span><span>{springK.toFixed(2)}</span></span>
          <input type="range" min={0.1} max={1} step={0.05} value={springK} onChange={(e) => setSpringK(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button type="button" onClick={() => setLocked((l) => !l)} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">
          {locked ? "Release Pawl" : "Engage Lock"}
        </button>
      </aside>
    </main>
  );
}
