"use client";

import React, { useState } from "react";
import { ThereminField } from "./theremin-field";

export default function Page() {
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 26</div>
        <h1 className="text-2xl tracking-tight">Theremin Field</h1>
        <ThereminField
          size={480}
          onField={(p, v) => {
            setPitch(p);
            setVolume(v);
          }}
        />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-400">
          Pitch
          <div className="mt-1 h-3 bg-neutral-950 border border-neutral-700">
            <div className="h-full bg-[#d4af37]" style={{ width: `${pitch * 100}%` }} />
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-400">
          Volume
          <div className="mt-1 h-3 bg-neutral-950 border border-neutral-700">
            <div className="h-full bg-[#2a6f6f]" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          Drag near the vertical rod for pitch, near the loop for volume. Field rings pulse with proximity.
        </p>
      </aside>
    </main>
  );
}
