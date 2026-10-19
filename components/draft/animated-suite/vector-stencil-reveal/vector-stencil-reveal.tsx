"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VectorStencilReveal() {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div
      onClick={() => setIsRevealed(!isRevealed)}
      className="relative w-full max-w-[260px] h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer select-none overflow-hidden shadow-xl"
    >
      <span className="font-mono text-xl font-black tracking-widest text-emerald-400">
        FUTURE UI
      </span>

      {/* SVG Masking Stencil Overlay */}
      <motion.svg
        animate={{ opacity: isRevealed ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 60"
      >
        <rect width="200" height="60" fill="#09090b" />
        <motion.circle
          cx="100"
          cy="30"
          r={isRevealed ? "80" : "15"}
          fill="#18181b"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </motion.svg>
    </div>
  );
}
