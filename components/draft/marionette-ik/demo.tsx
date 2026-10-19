"use client";

import React, { useState } from "react";
import { MarionetteIK } from "./marionette-ik";

export default function Page() {
  const [iterations, setIterations] = useState(8);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">
          Instrument · 07
        </div>
        <h1 className="text-2xl tracking-tight">Marionette IK</h1>
        <MarionetteIK iterations={iterations} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">
          Controls HUD
        </div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between">
            <span>FABRIK iters</span>
            <span className="text-neutral-200">{iterations}</span>
          </span>
          <input
            type="range"
            min={2}
            max={16}
            step={1}
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            className="accent-neutral-200"
          />
        </label>
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          Drag either hand or the torso. Strings are catenary sags from the control bar.
        </p>
      </aside>
    </main>
  );
}
