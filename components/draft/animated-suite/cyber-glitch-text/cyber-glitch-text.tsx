"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface CyberGlitchTextProps {
  text?: string;
}

export function CyberGlitchText({ text = "SYSTEM_OVERRIDE" }: CyberGlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 600);
  };

  return (
    <div
      onClick={triggerGlitch}
      onMouseEnter={triggerGlitch}
      className="relative cursor-pointer select-none py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center"
    >
      {/* Base Text */}
      <span className="relative z-10 font-mono text-base font-black tracking-widest text-emerald-400">
        {text}
      </span>

      {/* Glitch Offset 1 */}
      {isGlitching && (
        <motion.span
          animate={{ x: [-3, 4, -2, 0], y: [1, -2, 0] }}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className="absolute inset-0 z-0 flex items-center justify-center font-mono text-base font-black tracking-widest text-rose-500 opacity-80 pointer-events-none"
        >
          {text}
        </motion.span>
      )}

      {/* Glitch Offset 2 */}
      {isGlitching && (
        <motion.span
          animate={{ x: [3, -4, 2, 0], y: [-1, 2, 0] }}
          transition={{ repeat: Infinity, duration: 0.1, delay: 0.05 }}
          className="absolute inset-0 z-0 flex items-center justify-center font-mono text-base font-black tracking-widest text-sky-400 opacity-80 pointer-events-none"
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
