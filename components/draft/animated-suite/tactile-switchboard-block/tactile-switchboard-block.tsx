"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sliders } from "lucide-react";

export function TactileSwitchboardBlock() {
  const [switches, setSwitches] = useState([true, false, true]);

  const toggle = (idx: number) => {
    setSwitches((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <div className="w-full max-w-[280px] p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex flex-col gap-2.5 select-none">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          SWITCHBOARD
        </span>
        <span className="text-emerald-400">ONLINE</span>
      </div>

      <div className="flex items-center justify-between gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
        {switches.map((val, idx) => (
          <button
            key={idx}
            onClick={() => toggle(idx)}
            className="flex-1 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <motion.div
              animate={{
                scale: val ? 1.2 : 0.8,
                backgroundColor: val ? "#10b981" : "#71717a",
              }}
              className="w-2 h-2 rounded-full"
            />
            <span className="font-mono text-[10px] font-bold text-zinc-300">
              CH{idx + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
