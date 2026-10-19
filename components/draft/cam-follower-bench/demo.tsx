"use client";

import React, { useState } from "react";
import { CamFollowerBench, type CamProfile } from "./cam-follower-bench";

export default function Page() {
  const [profile, setProfile] = useState<CamProfile>("harmonic");
  const [omega, setOmega] = useState(1.8);
  const [k, setK] = useState(0.35);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 09</div>
        <h1 className="text-2xl tracking-tight">Cam Follower Bench</h1>
        <CamFollowerBench profile={profile} omega={omega} k={k} size={480} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">Controls HUD</div>
        {(["harmonic", "cycloidal", "plateau", "dwell"] as CamProfile[]).map((p) => (
          <button key={p} type="button" onClick={() => setProfile(p)} className={`border px-3 py-2 text-[10px] uppercase tracking-widest ${profile === p ? "border-neutral-300 bg-neutral-700" : "border-neutral-600 bg-neutral-800"}`}>
            {p}
          </button>
        ))}
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>ω</span><span>{omega.toFixed(2)}</span></span>
          <input type="range" min={0.2} max={4} step={0.05} value={omega} onChange={(e) => setOmega(Number(e.target.value))} className="accent-neutral-200" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between"><span>Spring k</span><span>{k.toFixed(2)}</span></span>
          <input type="range" min={0.1} max={1} step={0.01} value={k} onChange={(e) => setK(Number(e.target.value))} className="accent-neutral-200" />
        </label>
      </aside>
    </main>
  );
}
