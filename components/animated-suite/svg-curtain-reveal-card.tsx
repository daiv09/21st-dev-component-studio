"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function SvgCurtainRevealCard() {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div
      onClick={() => setIsRevealed(!isRevealed)}
      className="relative w-64 h-36 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col justify-between select-none cursor-pointer overflow-hidden shadow-xl"
    >
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 z-10">
        <Sparkles className="w-4 h-4" />
        <span>REVEALED REPOSITORY</span>
      </div>

      <p className="text-xs text-zinc-400 z-10">
        Click to shutter diagonal vector blinds.
      </p>

      {/* SVG Diagonal Blinds Curtain */}
      <motion.svg
        animate={{ opacity: isRevealed ? 0 : 1 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 250 140"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x={i * 45 - 20}
            y="0"
            width="40"
            height="160"
            fill="#18181b"
            transform="rotate(15)"
          />
        ))}
      </motion.svg>
    </div>
  );
}
