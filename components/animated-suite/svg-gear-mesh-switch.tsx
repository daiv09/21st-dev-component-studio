"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export function SvgGearMeshSwitch() {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => setIsOn(!isOn);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Settings className="w-3.5 h-3.5 text-violet-500 animate-spin" />
        <span>INTERLOCKING GEARS</span>
      </div>

      <button
        onClick={toggle}
        type="button"
        className={`relative w-28 h-14 rounded-2xl p-2 border transition-colors duration-300 flex items-center justify-between shadow-lg ${
          isOn
            ? "bg-zinc-900 border-violet-500 dark:bg-zinc-950 dark:border-violet-400"
            : "bg-zinc-200 border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800"
        }`}
      >
        {/* Gear 1 */}
        <motion.div
          animate={{ rotate: isOn ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isOn ? "text-violet-400" : "text-zinc-500"
          }`}
        >
          <svg className="w-10 h-10" viewBox="0 0 100 100">
            <path
              d="M50 15 L58 15 L60 25 L70 28 L78 20 L83 25 L78 35 L85 43 L95 43 L95 51 L85 53 L83 63 L91 71 L86 76 L76 71 L70 79 L73 89 L65 92 L60 82 L50 85 Z"
              fill="currentColor"
            />
            <circle cx="50" cy="50" r="16" fill="#09090b" />
          </svg>
        </motion.div>

        {/* Gear 2 (Rotates Counter-Clockwise) */}
        <motion.div
          animate={{ rotate: isOn ? -180 : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isOn ? "text-violet-400" : "text-zinc-400"
          }`}
        >
          <svg className="w-10 h-10" viewBox="0 0 100 100">
            <path
              d="M50 15 L58 15 L60 25 L70 28 L78 20 L83 25 L78 35 L85 43 L95 43 L95 51 L85 53 L83 63 L91 71 L86 76 L76 71 L70 79 L73 89 L65 92 L60 82 L50 85 Z"
              fill="currentColor"
            />
            <circle cx="50" cy="50" r="16" fill="#09090b" />
          </svg>
        </motion.div>
      </button>
    </div>
  );
}
