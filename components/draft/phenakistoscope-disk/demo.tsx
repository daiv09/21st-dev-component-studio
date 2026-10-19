"use client";

import React, { useState } from "react";
import { PhenakistoscopeDisk } from "./phenakistoscope-disk";

export default function Page() {
  const [omega, setOmega] = useState(2.5);
  const [frames, setFrames] = useState(12);
  const [subject, setSubject] = useState<"walker" | "bird" | "pulse">("walker");

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 23</div>
        <h1 className="text-2xl tracking-tight">Phenakistoscope Disk</h1>
        <PhenakistoscopeDisk omega={omega} frames={frames} subject={subject} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        {(["walker", "bird", "pulse"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSubject(s)} className={`border px-3 py-2 text-[10px] uppercase tracking-widest ${subject === s ? "border-neutral-300 bg-neutral-700" : "border-neutral-600 bg-neutral-800"}`}>{s}</button>
        ))}
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>ω</span><span>{omega.toFixed(2)}</span></span>
          <input type="range" min={0.5} max={6} step={0.1} value={omega} onChange={(e) => setOmega(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Frames</span><span>{frames}</span></span>
          <input type="range" min={8} max={16} step={1} value={frames} onChange={(e) => setFrames(Number(e.target.value))} className="accent-neutral-200" />
        </label>
      </aside>
    </main>
  );
}
