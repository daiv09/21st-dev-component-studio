"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ShutterSplitHeadline() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>3-TIER SHUTTER HEADLINE</span>
      </div>

      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex flex-col justify-between p-2.5 cursor-pointer overflow-hidden"
      >
        {["DISRUPT", "INNOVATE", "TRANSCEND"].map((word, idx) => {
          const shift = open ? (idx === 1 ? -16 : 16) : 0;
          return (
            <motion.div
              key={word}
              animate={{ x: shift }}
              transition={{ type: "spring", stiffness: 450, damping: 22, delay: idx * 0.04 }}
              className="flex items-center justify-between font-mono text-xs font-black tracking-widest text-zinc-100 border-b border-zinc-900 pb-0.5 last:border-none"
            >
              <span className="text-amber-400">0{idx + 1}</span>
              <span>{word}</span>
            </motion.div>
          );
        })}
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO DISPLACE SHUTTERS</span>
    </div>
  );
}
