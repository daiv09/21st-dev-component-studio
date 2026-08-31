"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Power } from "lucide-react";

interface KineticToggleSwitchProps {
  initialState?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
}

export function KineticToggleSwitch({
  initialState = false,
  label = "System Override",
  onChange,
}: KineticToggleSwitchProps) {
  const [isOn, setIsOn] = useState(initialState);

  const toggle = () => {
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        <div
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
            isOn
              ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
              : "bg-zinc-300 dark:bg-zinc-700"
          }`}
        />
      </div>

      <button
        onClick={toggle}
        type="button"
        aria-label={label}
        className={`relative w-24 h-12 rounded-full p-1.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border ${
          isOn
            ? "bg-zinc-900 border-emerald-500/50 dark:bg-zinc-950 dark:border-emerald-500/60"
            : "bg-zinc-200 border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800"
        }`}
      >
        <motion.div
          className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md ${
            isOn ? "bg-emerald-500 text-zinc-950" : "bg-white text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
          animate={{
            x: isOn ? 48 : 0,
            rotate: isOn ? 180 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <Power className="w-4 h-4 stroke-[2.5]" />
        </motion.div>

        <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none text-[10px] font-mono font-bold">
          <span className={`transition-opacity duration-200 ${isOn ? "opacity-0" : "opacity-40 text-zinc-700 dark:text-zinc-300 ml-[42px]"}`}>
            OFF
          </span>
          <span className={`transition-opacity duration-200 ${isOn ? "opacity-100 text-emerald-400 mr-[42px]" : "opacity-0"}`}>
            ON
          </span>
        </div>
      </button>
    </div>
  );
}
