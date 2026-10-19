"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function SplitShutterPromoCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full max-w-[280px] h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl p-3 flex items-center justify-between cursor-pointer overflow-hidden select-none"
    >
      <div className="flex flex-col gap-0.5 z-10">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PRO EDITION</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">Deploy kinetic suite</span>
      </div>

      <motion.div
        animate={{ x: hovered ? 4 : 0 }}
        className="p-2 rounded-xl bg-amber-400 text-zinc-950 font-bold z-10 shadow-md"
      >
        <ArrowRight className="w-4 h-4 stroke-[3]" />
      </motion.div>

      {/* Interlocking shutter lines */}
      <motion.div
        animate={{ scaleX: hovered ? 1.05 : 1 }}
        className="absolute inset-y-0 right-0 w-24 bg-zinc-900 border-l border-zinc-800 -z-0 transform -skew-x-12"
      />
    </div>
  );
}
