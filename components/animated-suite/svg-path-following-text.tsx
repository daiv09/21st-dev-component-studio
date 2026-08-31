"use client";

import React from "react";
import { motion } from "framer-motion";

export function SvgPathFollowingText() {
  return (
    <div className="w-full max-w-[280px] p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center gap-2 select-none shadow-xl">
      <svg className="w-full h-20" viewBox="0 0 300 80">
        <path
          id="wavePath"
          d="M 10,40 Q 75,10 150,40 T 290,40"
          fill="none"
          stroke="#3f3f46"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        <text fontSize="14" fontWeight="bold" fontFamily="monospace" fill="#10b981">
          <motion.textPath
            href="#wavePath"
            animate={{ startOffset: ["0%", "100%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          >
            • VECTOR KINETICS • WAVE TRAJECTORY • AWWWARDS •
          </motion.textPath>
        </text>
      </svg>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        PATH FOLLOWING TYPOGRAPHY
      </span>
    </div>
  );
}
