"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VectorGlitchSliceText() {
  const [isSliced, setIsSliced] = useState(false);

  const toggle = () => {
    setIsSliced(true);
    setTimeout(() => setIsSliced(false), 500);
  };

  return (
    <div
      onClick={toggle}
      onMouseEnter={toggle}
      className="relative p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-pointer select-none shadow-xl w-full max-w-[260px]"
    >
      <div className="relative font-mono text-xl font-black text-rose-500 tracking-widest">
        <span>CYBER SLICE</span>

        {/* Top Slice Mask */}
        <motion.div
          animate={{ x: isSliced ? -8 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-zinc-950 text-emerald-400 overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
        >
          CYBER SLICE
        </motion.div>

        {/* Bottom Slice Mask */}
        <motion.div
          animate={{ x: isSliced ? 8 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-zinc-950 text-sky-400 overflow-hidden"
          style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
        >
          CYBER SLICE
        </motion.div>
      </div>

      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        CLICK TO SLICE MASK
      </span>
    </div>
  );
}
