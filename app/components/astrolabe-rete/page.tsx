"use client";

import React, { useState } from "react";
import { AstrolabeRete } from "./astrolabe-rete";

export default function Page() {
  const [latitude, setLatitude] = useState(40);
  const [reteAngle, setReteAngle] = useState(25);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 13</div>
        <h1 className="text-2xl tracking-tight">Astrolabe Rete</h1>
        <AstrolabeRete latitude={latitude} reteAngle={reteAngle} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Latitude°</span><span>{latitude}</span></span>
          <input type="range" min={0} max={70} step={1} value={latitude} onChange={(e) => setLatitude(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Rete°</span><span>{reteAngle}</span></span>
          <input type="range" min={0} max={360} step={1} value={reteAngle} onChange={(e) => setReteAngle(Number(e.target.value))} className="accent-neutral-200" />
        </label>
      </aside>
    </main>
  );
}
