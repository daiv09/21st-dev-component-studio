"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function VectorWaveformSynth() {
  const [waveType, setWaveType] = useState<"sine" | "square" | "saw">("sine");

  const cycleWave = () => {
    const types: ("sine" | "square" | "saw")[] = ["sine", "square", "saw"];
    const idx = (types.indexOf(waveType) + 1) % types.length;
    setWaveType(types[idx]);
  };

  const getPath = () => {
    if (waveType === "sine") return "M 0,20 Q 25,0 50,20 T 100,20 T 150,20 T 200,20";
    if (waveType === "square") return "M 0,30 L 0,10 L 40,10 L 40,30 L 80,30 L 80,10 L 120,10 L 120,30 L 160,30 L 160,10 L 200,10";
    return "M 0,30 L 40,10 L 40,30 L 80,10 L 80,30 L 120,10 L 120,30 L 160,10 L 160,30 L 200,10";
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[260px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          SYNTH WAVEFORM
        </span>
        <span className="text-sky-400 font-extrabold uppercase">{waveType}</span>
      </div>

      <div
        onClick={cycleWave}
        className="w-full h-16 rounded-2xl bg-zinc-950 border border-zinc-800 p-2 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        <svg className="w-full h-full" viewBox="0 0 200 40">
          <motion.path
            d={getPath()}
            stroke="#38bdf8"
            strokeWidth="3"
            fill="none"
            transition={{ duration: 0.3 }}
          />
        </svg>
      </div>
    </div>
  );
}
