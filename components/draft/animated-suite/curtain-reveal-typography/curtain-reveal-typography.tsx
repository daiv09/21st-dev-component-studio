"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

export function CurtainRevealTypography() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Eye className="w-3.5 h-3.5 text-indigo-500" />
        <span>STAGGERED SLAT REVEAL</span>
      </div>

      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden"
      >
        <span className="font-mono text-xl font-black text-emerald-400 tracking-widest z-0">
          PROTOTYPE 2026
        </span>

        {/* Alternating horizontal curtain slats */}
        {[0, 1, 2, 3].map((idx) => (
          <motion.div
            key={idx}
            animate={{
              x: open ? (idx % 2 === 0 ? "105%" : "-105%") : "0%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: idx * 0.05,
            }}
            className="absolute left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-10 flex items-center justify-center"
            style={{
              top: `${idx * 25}%`,
              height: "25%",
            }}
          >
            <span className="text-[10px] font-mono text-zinc-600 font-bold tracking-widest uppercase">
              • CLASSIFIED •
            </span>
          </motion.div>
        ))}
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO OPEN SLATS</span>
    </div>
  );
}
