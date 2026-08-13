"use client";

import React, { useState } from "react";
import { SplitFlapChronograph } from "./split-flap-chronograph";

export default function Page() {
  const [value, setValue] = useState("JFK 14:30 GATE");
  const [draft, setDraft] = useState("JFK 14:30 GATE");
  const [stepMs, setStepMs] = useState(55);
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">
          Instrument · 04
        </div>
        <h1 className="text-2xl tracking-tight">Split-Flap Chronograph</h1>
        <SplitFlapChronograph key={key} value={value} digits={14} stepMs={stepMs} />
      </div>
      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">
          Controls HUD
        </div>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          Message
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.toUpperCase())}
            maxLength={14}
            className="bg-neutral-950 border border-neutral-700 px-2 py-2 text-neutral-100 tracking-widest"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-400">
          <span className="flex justify-between">
            <span>Step ms</span>
            <span className="text-neutral-200">{stepMs}</span>
          </span>
          <input
            type="range"
            min={25}
            max={120}
            step={1}
            value={stepMs}
            onChange={(e) => setStepMs(Number(e.target.value))}
            className="accent-neutral-200"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setValue(draft);
            setKey((k) => k + 1);
          }}
          className="border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-neutral-700"
        >
          Flip Board
        </button>
      </aside>
    </main>
  );
}
