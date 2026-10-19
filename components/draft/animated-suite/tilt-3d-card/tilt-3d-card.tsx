"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";

export function Tilt3dCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setRotateX((-y / rect.height) * 30);
    setRotateY((x / rect.width) * 30);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="perspective-1000 select-none p-2">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-64 p-5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-3 relative transform-style-3d cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-500 uppercase">
            3D PERSPECTIVE
          </span>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
            Spatial Glass Core
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Hover to tilt with dynamic spring response.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs font-mono font-semibold text-zinc-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Interactive
          </span>
          <span>v2.4</span>
        </div>
      </motion.div>
    </div>
  );
}
