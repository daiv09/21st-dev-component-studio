"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface SvgMorphingBlobToggleProps {
  label?: string;
  onChange?: (state: boolean) => void;
}

export function SvgMorphingBlobToggle({
  label = "VECTOR BLOB SWITCH",
  onChange,
}: SvgMorphingBlobToggleProps) {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => {
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  // SVG morph paths for liquid blob turning into smooth circle
  const pathOff = "M 20,40 Q 10,20 40,15 Q 70,10 80,40 Q 90,70 60,80 Q 30,90 20,40 Z";
  const pathOn = "M 30,50 Q 20,20 50,20 Q 80,20 70,50 Q 80,80 50,80 Q 20,80 30,50 Z";

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <span className={isOn ? "text-emerald-500 font-extrabold" : "text-zinc-400"}>
          {isOn ? "[ACTIVE]" : "[OFF]"}
        </span>
      </div>

      <button
        onClick={toggle}
        type="button"
        className={`relative w-28 h-14 rounded-full p-1 border transition-colors duration-300 ${
          isOn
            ? "bg-zinc-900 border-emerald-500 dark:bg-zinc-950 dark:border-emerald-400"
            : "bg-zinc-200 border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800"
        }`}
      >
        <motion.div
          animate={{ x: isOn ? 56 : 0 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="w-12 h-12 flex items-center justify-center"
        >
          <svg className="w-12 h-12" viewBox="0 0 100 100">
            <motion.path
              d={isOn ? pathOn : pathOff}
              fill={isOn ? "#10b981" : "#71717a"}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
            {/* SVG Checkmark icon */}
            <motion.path
              d="M35 50 L45 60 L65 40"
              stroke="#09090b"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={false}
              animate={{
                pathLength: isOn ? 1 : 0,
                opacity: isOn ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </motion.div>
      </button>
    </div>
  );
}
