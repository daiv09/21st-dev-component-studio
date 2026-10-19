"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

export function GlowBorderCard() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className="relative w-64 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg flex flex-col gap-3 select-none overflow-hidden cursor-pointer"
    >
      {/* Animated Tracer Edge Beam */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 border-2 border-emerald-500 rounded-2xl pointer-events-none"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-zinc-900 text-emerald-400 dark:bg-zinc-800 shadow-sm">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Perimeter Tracer
          </h4>
          <span className="text-[10px] font-mono text-emerald-500 font-semibold">
            {isFocused ? "LOCKED" : "HOVER ME"}
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Highlight tracer activates around the perimeter on hover.
      </p>
    </div>
  );
}
