"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sliders } from "lucide-react";

export function ElasticCharAccordion() {
  const [spread, setSpread] = useState(1);
  const WORD = "STRETCH";

  const toggle = () => setSpread((s) => (s >= 3 ? 1 : s + 1));

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          KERNING ACCORDION
        </span>
        <span className="text-indigo-400 font-extrabold">{spread}X SPREAD</span>
      </div>

      <div
        onClick={toggle}
        className="w-full h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center cursor-pointer overflow-hidden px-4"
      >
        <motion.div
          animate={{ gap: `${spread * 12}px` }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center justify-center font-mono text-xl font-black text-indigo-600 dark:text-indigo-400"
        >
          {WORD.split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </motion.div>
      </div>
      <span className="text-[10px] font-mono text-zinc-400">CLICK TO EXPAND KERNING</span>
    </div>
  );
}
