"use client";

import React, { useState } from "react";
import { HarmonographPlotter } from "./harmonograph-plotter";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-neutral-200">{value.toFixed(3)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-neutral-200"
      />
    </label>
  );
}

export default function Page() {
  const [freqA, setFreqA] = useState(3);
  const [freqB, setFreqB] = useState(2);
  const [phaseA, setPhaseA] = useState(0);
  const [phaseB, setPhaseB] = useState(Math.PI / 2);
  const [damping, setDamping] = useState(0.008);
  const [running, setRunning] = useState(true);
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">
          Instrument · 01
        </div>
        <h1 className="text-2xl tracking-tight text-neutral-100">
          Harmonograph Plotter
        </h1>
        <HarmonographPlotter
          key={key}
          freqA={freqA}
          freqB={freqB}
          phaseA={phaseA}
          phaseB={phaseB}
          damping={damping}
          running={running}
          size={480}
        />
      </div>

      <aside className="w-full max-w-xs border border-neutral-800 bg-neutral-900 p-5 shadow-[6px_6px_0_#000] flex flex-col gap-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-800 pb-2">
          Controls HUD
        </div>
        <Slider label="Freq A" value={freqA} min={0.5} max={8} step={0.01} onChange={setFreqA} />
        <Slider label="Freq B" value={freqB} min={0.5} max={8} step={0.01} onChange={setFreqB} />
        <Slider label="Phase A" value={phaseA} min={0} max={Math.PI * 2} step={0.01} onChange={setPhaseA} />
        <Slider label="Phase B" value={phaseB} min={0} max={Math.PI * 2} step={0.01} onChange={setPhaseB} />
        <Slider label="Damping" value={damping} min={0.001} max={0.05} step={0.001} onChange={setDamping} />
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="flex-1 border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-neutral-700"
          >
            {running ? "Pause" : "Run"}
          </button>
          <button
            type="button"
            onClick={() => setKey((k) => k + 1)}
            className="flex-1 border border-neutral-600 bg-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-neutral-700"
          >
            Clear
          </button>
        </div>
      </aside>
    </main>
  );
}
