"use client";

import React, { useState } from "react";
import { ZipperSeam } from "./zipper-seam";

export default function Page() {
  const [open, setOpen] = useState(0.35);
  const [label, setLabel] = useState("REVEALED");

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 18</div>
        <h1 className="text-2xl tracking-tight">Zipper Seam</h1>
        <ZipperSeam open={open} label={label} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Open</span><span>{open.toFixed(2)}</span></span>
          <input type="range" min={0} max={1} step={0.01} value={open} onChange={(e) => setOpen(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          Label
          <input value={label} onChange={(e) => setLabel(e.target.value.toUpperCase())} className="bg-neutral-950 border border-neutral-700 px-2 py-2 text-neutral-100" />
        </label>
      </aside>
    </main>
  );
}
