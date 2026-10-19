"use client";

import React, { useState } from "react";
import { PlotterPenDesk } from "./plotter-pen-desk";

const PRESETS: Record<string, string> = {
  rect: "M 20 30 L 80 30 L 80 70 L 20 70 Z",
  star: "M 50 15 L 61 40 L 88 40 L 66 57 L 74 82 L 50 66 L 26 82 L 34 57 L 12 40 L 39 40 Z",
  zigzag: "M 15 50 L 30 30 L 45 50 L 60 30 L 75 50 L 90 30",
};

export default function Page() {
  const [preset, setPreset] = useState("star");
  const [feedRate, setFeedRate] = useState(80);
  const [running, setRunning] = useState(true);
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 16</div>
        <h1 className="text-2xl tracking-tight">Plotter Pen Desk</h1>
        <PlotterPenDesk key={key} pathD={PRESETS[preset]} feedRate={feedRate} running={running} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        {Object.keys(PRESETS).map((p) => (
          <button key={p} type="button" onClick={() => { setPreset(p); setKey((k) => k + 1); }} className={`border px-3 py-2 text-[10px] uppercase tracking-widest ${preset === p ? "border-neutral-300 bg-neutral-700" : "border-neutral-600 bg-neutral-800"}`}>
            {p}
          </button>
        ))}
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Feed</span><span>{feedRate}</span></span>
          <input type="range" min={20} max={200} step={5} value={feedRate} onChange={(e) => setFeedRate(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setRunning((r) => !r)} className="flex-1 border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">{running ? "Pause" : "Run"}</button>
          <button type="button" onClick={() => setKey((k) => k + 1)} className="flex-1 border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">Replay</button>
        </div>
      </aside>
    </main>
  );
}
