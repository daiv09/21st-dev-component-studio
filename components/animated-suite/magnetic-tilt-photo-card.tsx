"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export function MagneticTiltPhotoCard() {
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
    <div className="perspective-1000 select-none">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-64 h-36 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between cursor-pointer transform-style-3d"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
            Awwwards Selection
          </span>
          <Award className="w-5 h-5 text-amber-500" />
        </div>

        {/* Floating 3D Badge Layer */}
        <motion.div
          animate={{ z: 20 }}
          className="self-start px-3 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-mono text-[10px] font-extrabold shadow-md"
        >
          FEATURED WINNER
        </motion.div>
      </motion.div>
    </div>
  );
}
