"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function SvgCalligraphyWrite() {
  const [replay, setReplay] = useState(0);

  const restart = () => setReplay((prev) => prev + 1);

  return (
    <div
      onClick={restart}
      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-pointer select-none shadow-xl w-full max-w-[260px]"
    >
      <svg className="w-full h-16" viewBox="0 0 200 60">
        <motion.path
          key={replay}
          d="M 20,40 Q 50,10 80,40 T 140,40 T 180,20"
          stroke="#34d399"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        CLICK TO REPLAY CALLIGRAPHY
      </span>
    </div>
  );
}
