"use client";

import React, { useState } from "react";
import { Cpu } from "lucide-react";

export function SegmentDisplayBadge() {
  const [value, setValue] = useState("8888");

  const cycle = () => {
    const presets = ["1337", "2026", "9999", "4040", "8888"];
    const idx = (presets.indexOf(value) + 1) % presets.length;
    setValue(presets[idx]);
  };

  return (
    <div
      onClick={cycle}
      className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-lg cursor-pointer select-none group"
    >
      <div className="p-2 rounded-xl bg-zinc-900 text-amber-500 border border-zinc-800 group-hover:scale-105 transition-transform">
        <Cpu className="w-5 h-5" />
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
          HARDWARE ID
        </span>
        <span className="font-mono text-2xl font-black tracking-widest text-amber-400 drop-shadow-[0_0_8px_#f59e0b]">
          {value}
        </span>
      </div>
    </div>
  );
}
