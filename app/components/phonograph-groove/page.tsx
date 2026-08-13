"use client";

import React, { useState } from "react";
import { PhonographGroove } from "./phonograph-groove";

export default function Page() {
  const [omega, setOmega] = useState(1.2);
  const [pitch, setPitch] = useState(4.5);
  const [modulation, setModulation] = useState(2.2);
  const [playing, setPlaying] = useState(true);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 24</div>
        <h1 className="text-2xl tracking-tight">Phonograph Groove</h1>
        <PhonographGroove omega={omega} pitch={pitch} modulation={modulation} playing={playing} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>ω</span><span>{omega.toFixed(2)}</span></span>
          <input type="range" min={0} max={4} step={0.05} value={omega} onChange={(e) => setOmega(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Pitch</span><span>{pitch.toFixed(1)}</span></span>
          <input type="range" min={2} max={10} step={0.1} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Mod</span><span>{modulation.toFixed(1)}</span></span>
          <input type="range" min={0} max={6} step={0.1} value={modulation} onChange={(e) => setModulation(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button type="button" onClick={() => setPlaying((p) => !p)} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">{playing ? "Pause" : "Play"}</button>
      </aside>
    </main>
  );
}
