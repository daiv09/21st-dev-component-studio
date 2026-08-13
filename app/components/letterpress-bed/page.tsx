"use client";

import React, { useState } from "react";
import { LetterpressBed } from "./letterpress-bed";

export default function Page() {
  const [text, setText] = useState("PRESS");
  const [pressure, setPressure] = useState(0.7);
  const [ink, setInk] = useState(0.85);
  const [locked, setLocked] = useState(true);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 15</div>
        <h1 className="text-2xl tracking-tight">Letterpress Bed</h1>
        <LetterpressBed text={text} pressure={pressure} ink={ink} locked={locked} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          Text
          <input value={text} maxLength={8} onChange={(e) => setText(e.target.value.toUpperCase())} className="bg-neutral-950 border border-neutral-700 px-2 py-2 text-neutral-100 tracking-widest" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Pressure</span><span>{pressure.toFixed(2)}</span></span>
          <input type="range" min={0} max={1} step={0.01} value={pressure} onChange={(e) => setPressure(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Ink</span><span>{ink.toFixed(2)}</span></span>
          <input type="range" min={0} max={1} step={0.01} value={ink} onChange={(e) => setInk(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button type="button" onClick={() => setLocked((l) => !l)} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">
          {locked ? "Unlock Chase" : "Lock Quoins"}
        </button>
      </aside>
    </main>
  );
}
