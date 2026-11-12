"use client";
import { motion } from "framer-motion";

export default function BrushCrossText() {
  return (
    <div className="relative flex flex-col items-center justify-center p-12 bg-black rounded-2xl overflow-hidden select-none">
      <span className="text-[10px] tracking-[0.35em] text-neutral-400 uppercase mb-2">
        RICH CLUB
      </span>

      <div className="relative flex flex-col items-center font-black text-6xl sm:text-7xl text-white tracking-tight leading-[0.85]">
        <span>RICH</span>
        <span>CLUB</span>

        {/* SVG Rough Brush X Overlay */}
        <svg
          viewBox="0 0 300 200"
          className="absolute -inset-4 w-[115%] h-[120%] pointer-events-none"
        >
          <defs>
            <filter id="rough-brush">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
            </filter>
          </defs>

          <motion.line
            x1="30"
            y1="20"
            x2="270"
            y2="180"
            stroke="#ff5500"
            strokeWidth="36"
            strokeLinecap="square"
            filter="url(#rough-brush)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "circOut", repeat: Infinity, repeatDelay: 2.5 }}
          />
          <motion.line
            x1="270"
            y1="20"
            x2="30"
            y2="180"
            stroke="#ff6a00"
            strokeWidth="36"
            strokeLinecap="square"
            filter="url(#rough-brush)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.35,
              ease: "circOut",
              repeat: Infinity,
              repeatDelay: 2.5,
            }}
          />
        </svg>
      </div>

      <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase mt-3">
        KITTL APPAREL CO.
      </span>
    </div>
  );
}

