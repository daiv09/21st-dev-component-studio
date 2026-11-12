"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const targets = ["DESIGN.", "BUILD.", "SCALE.", "GROW."];

export default function DynamicResizeHeadline() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % targets.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl border border-neutral-200 select-none">
      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
        Auto-Layout Frame
      </span>
      <div className="flex items-center gap-2 font-black text-4xl sm:text-5xl text-neutral-900">
        <span>WE</span>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative px-4 py-1 bg-[#c8ff29] border-2 border-neutral-950"
        >
          <motion.span
            key={targets[idx]}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            {targets[idx]}
          </motion.span>
          <span className="absolute -bottom-5 right-0 bg-neutral-950 text-white text-[9px] font-mono px-1.5 py-0.5">
            {targets[idx].length * 28}px × 56px
          </span>
        </motion.div>
      </div>
    </div>
  );
}

