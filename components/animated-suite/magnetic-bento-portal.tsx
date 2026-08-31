"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Layers, ArrowUpRight } from "lucide-react";

export function MagneticBentoPortal() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: (-y / rect.height) * 20, y: (x / rect.width) * 20 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="perspective-1000 select-none w-full max-w-[280px]">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="w-full p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-3 transform-style-3d cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <motion.span
            animate={{ z: 25 }}
            className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400"
          >
            BENTO V3
          </motion.span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Magnetic Kinetic Block
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Detached spatial card with 3D levitating badge.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Interactive
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
        </div>
      </motion.div>
    </div>
  );
}
