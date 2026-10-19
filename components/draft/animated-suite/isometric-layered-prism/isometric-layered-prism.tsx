"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

export function IsometricLayeredPrism() {
  const [spread, setSpread] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <span>ISOMETRIC TIER STACK</span>
      </div>

      <div
        onMouseEnter={() => setSpread(true)}
        onMouseLeave={() => setSpread(false)}
        className="perspective-1000 relative w-full h-24 flex items-center justify-center cursor-pointer"
      >
        {/* Tier 1 */}
        <motion.div
          animate={{ y: spread ? -18 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute w-36 h-8 rounded-xl bg-indigo-500 shadow-md border border-white/20 flex items-center justify-center text-[10px] font-mono font-bold text-white z-30"
        >
          APPLICATION LAYER
        </motion.div>

        {/* Tier 2 */}
        <motion.div
          animate={{ y: spread ? 0 : 6 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute w-40 h-8 rounded-xl bg-violet-600 shadow-md border border-white/20 flex items-center justify-center text-[10px] font-mono font-bold text-white z-20"
        >
          LOGIC PROTOCOL
        </motion.div>

        {/* Tier 3 */}
        <motion.div
          animate={{ y: spread ? 18 : 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute w-44 h-8 rounded-xl bg-zinc-800 shadow-md border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300 z-10"
        >
          HARDWARE KERNEL
        </motion.div>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO SEPARATE TIERS</span>
    </div>
  );
}
