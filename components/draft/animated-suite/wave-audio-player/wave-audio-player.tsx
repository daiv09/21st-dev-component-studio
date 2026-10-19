"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music } from "lucide-react";

export function WaveAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = () => setIsPlaying(!isPlaying);

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl select-none w-full max-w-[260px]">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md hover:bg-emerald-400 transition-colors"
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
      </button>

      <div className="flex flex-col flex-1 gap-1 overflow-hidden">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold truncate">
          <Music className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">Cybernetic Horizon</span>
        </div>

        {/* Waveform Bars */}
        <div className="flex items-center gap-1 h-5">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-emerald-500 rounded-full"
              animate={{
                height: isPlaying ? [4, 18, 6, 20, 4] : 4,
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8 + (i % 3) * 0.2,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
