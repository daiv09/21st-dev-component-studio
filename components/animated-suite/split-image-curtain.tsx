"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

export function SplitImageCurtain() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="relative w-60 h-36 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer select-none overflow-hidden shadow-xl"
    >
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
        <Eye className="w-4 h-4" />
        <span>HIDDEN CONTENT</span>
      </div>

      {/* 4 Vector Curtain Slats */}
      {[0, 1, 2, 3].map((idx) => (
        <motion.div
          key={idx}
          animate={{
            y: isOpen ? (idx % 2 === 0 ? "-100%" : "100%") : "0%",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: idx * 0.04 }}
          className="absolute top-0 bottom-0 bg-zinc-950 border-r border-zinc-800"
          style={{
            left: `${idx * 25}%`,
            width: "25%",
          }}
        />
      ))}
    </div>
  );
}
