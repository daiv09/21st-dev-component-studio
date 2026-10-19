"use client";

import React, { useState } from "react";
import { StringArtLoom } from "./string-art-loom";

export default function Page() {
  const [motif, setMotif] = useState<"circle" | "heart" | "spiral">("heart");
  const [chords, setChords] = useState(400);
  const [pegs, setPegs] = useState(120);
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 17</div>
        <h1 className="text-2xl tracking-tight">String Art Loom</h1>
        <StringArtLoom key={key} motif={motif} chords={chords} pegs={pegs} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        {(["heart", "circle", "spiral"] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMotif(m); setKey((k) => k + 1); }} className={`border px-3 py-2 text-[10px] uppercase tracking-widest ${motif === m ? "border-neutral-300 bg-neutral-700" : "border-neutral-600 bg-neutral-800"}`}>{m}</button>
        ))}
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Chords</span><span>{chords}</span></span>
          <input type="range" min={100} max={800} step={20} value={chords} onChange={(e) => setChords(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Pegs</span><span>{pegs}</span></span>
          <input type="range" min={60} max={180} step={4} value={pegs} onChange={(e) => setPegs(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <button type="button" onClick={() => setKey((k) => k + 1)} className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest">Rewave</button>
      </aside>
    </main>
  );
}
