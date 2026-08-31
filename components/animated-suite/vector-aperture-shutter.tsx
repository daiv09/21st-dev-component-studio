"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export function VectorApertureShutter() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const blades = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Camera className="w-3.5 h-3.5 text-amber-500" />
        <span>APERTURE: {isOpen ? "f/1.4 [OPEN]" : "f/22 [CLOSED]"}</span>
      </div>

      <div
        onClick={toggle}
        className="relative w-28 h-28 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden shadow-xl"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {blades.map((rot, idx) => (
            <motion.path
              key={idx}
              d="M 50,50 L 85,25 L 95,55 Z"
              fill="#27272a"
              stroke="#18181b"
              strokeWidth="1.5"
              style={{ transformOrigin: "50px 50px" }}
              animate={{
                rotate: rot + (isOpen ? 35 : 0),
                scale: isOpen ? 0.65 : 1,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
            />
          ))}
          <circle cx="50" cy="50" r={isOpen ? 22 : 6} fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
