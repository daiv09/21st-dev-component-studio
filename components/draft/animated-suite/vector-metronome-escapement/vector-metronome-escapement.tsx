"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";

export function VectorMetronomeEscapement() {
  const [bpm, setBpm] = useState(120);

  const cycleBpm = () => {
    const bpms = [60, 90, 120, 160];
    const idx = (bpms.indexOf(bpm) + 1) % bpms.length;
    setBpm(bpms[idx]);
  };

  const period = 60 / bpm;

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Timer className="w-3.5 h-3.5 text-amber-500" />
        <span>TEMPO: {bpm} BPM</span>
      </div>

      <div
        onClick={cycleBpm}
        className="relative w-28 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        {/* Oscillating Arm */}
        <motion.div
          animate={{ rotate: [-25, 25, -25] }}
          transition={{ repeat: Infinity, duration: period, ease: "easeInOut" }}
          className="w-1 h-24 bg-amber-400 rounded-full origin-bottom relative shadow-md"
          style={{ bottom: "-10px" }}
        >
          {/* Weight Bob */}
          <div className="w-4 h-4 rounded-full bg-amber-500 border border-white absolute top-4 left-1/2 -translate-x-1/2" />
        </motion.div>
      </div>
    </div>
  );
}
