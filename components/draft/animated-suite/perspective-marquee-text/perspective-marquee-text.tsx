"use client";

import React from "react";
import { motion } from "framer-motion";

export function PerspectiveMarqueeText() {
  return (
    <div className="perspective-1000 w-full max-w-[280px] p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center overflow-hidden shadow-xl select-none">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        className="flex items-center gap-6 whitespace-nowrap font-mono text-sm font-black text-amber-400 transform -rotate-3"
      >
        <span>⚡ 3D PERSPECTIVE MARQUEE ⚡ AWWWARDS DESIGN ⚡ KINETIC VECTOR</span>
        <span>⚡ 3D PERSPECTIVE MARQUEE ⚡ AWWWARDS DESIGN ⚡ KINETIC VECTOR</span>
      </motion.div>
    </div>
  );
}
