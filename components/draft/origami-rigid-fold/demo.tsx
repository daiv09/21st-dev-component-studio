"use client";

import React, { useState } from "react";
import { OrigamiRigidFold } from "./origami-rigid-fold";

export default function Page() {
  const [fold, setFold] = useState(0.55);
  const [dihedral, setDihedral] = useState(90);
  const [pattern, setPattern] = useState<"waterbomb" | "miura" | "preliminary">("waterbomb");

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 25</div>
        <h1 className="text-2xl tracking-tight">Origami Rigid Fold</h1>
        <OrigamiRigidFold fold={fold} dihedral={dihedral} pattern={pattern} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        {(["waterbomb", "miura", "preliminary"] as const).map((p) => (
          <button key={p} type="button" onClick={() => setPattern(p)} className={`border px-3 py-2 text-[10px] uppercase tracking-widest ${pattern === p ? "border-neutral-300 bg-neutral-700" : "border-neutral-600 bg-neutral-800"}`}>{p}</button>
        ))}
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Fold</span><span>{fold.toFixed(2)}</span></span>
          <input type="range" min={0} max={1} step={0.01} value={fold} onChange={(e) => setFold(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Dihedral°</span><span>{dihedral}</span></span>
          <input type="range" min={30} max={160} step={1} value={dihedral} onChange={(e) => setDihedral(Number(e.target.value))} className="accent-neutral-200" />
        </label>
      </aside>
    </main>
  );
}
