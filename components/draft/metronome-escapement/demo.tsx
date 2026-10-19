"use client";

import React, { useState } from "react";
import { MetronomeEscapement } from "./metronome-escapement";

export default function Page() {
  const [bpm, setBpm] = useState(96);
  const [running, setRunning] = useState(true);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 27</div>
        <h1 className="text-2xl tracking-tight">Metronome Escapement</h1>
        <MetronomeEscapement bpm={bpm} running={running} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>BPM</span><span>{bpm}</span></span>
          <input type="range" min={40} max={208} step={1} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button type="button" onClick={() => setRunning((r) => !r)} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">{running ? "Stop" : "Start"}</button>
      </aside>
    </main>
  );
}
