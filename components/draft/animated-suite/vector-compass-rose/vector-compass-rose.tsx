"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function VectorCompassRose() {
  const [heading, setHeading] = useState(45);

  const rotate = () => setHeading((prev) => (prev + 90) % 360);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Compass className="w-3.5 h-3.5 text-sky-400" />
        <span>HEADING: {heading}° NNE</span>
      </div>

      <div
        onClick={rotate}
        className="relative w-32 h-32 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        <motion.svg
          animate={{ rotate: heading }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full h-full p-2"
          viewBox="0 0 100 100"
        >
          {/* Compass Star Rose */}
          <polygon points="50,10 56,44 90,50 56,56 50,90 44,56 10,50 44,44" fill="#0284c7" />
          <polygon points="50,10 50,50 90,50" fill="#38bdf8" />
          <polygon points="50,90 50,50 10,50" fill="#38bdf8" />
        </motion.svg>
        <div className="absolute w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 shadow-md" />
      </div>
    </div>
  );
}
