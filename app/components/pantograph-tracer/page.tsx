"use client";

import React, { useState } from "react";
import { PantographTracer } from "./pantograph-tracer";

export default function Page() {
  const [scale, setScale] = useState(2);
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">
          Instrument · 03
        </div>
        <h1 className="text-2xl tracking-tight">Pantograph Tracer</h1>
        <PantographTracer key={key} scale={scale} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">
          Controls HUD
        </div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between">
            <span>Scale k</span>
            <span className="text-neutral-200">{scale.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={1.2}
            max={3.5}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="accent-neutral-200"
          />
        </label>
        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-neutral-700"
        >
          Clear Trace
        </button>
      </aside>
    </main>
  );
}
