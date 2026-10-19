"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface MorphingCheckboxProps {
  label?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function MorphingCheckbox({
  label = "Enable Quantum Encryption",
  defaultChecked = true,
  onChange,
}: MorphingCheckboxProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onChange?.(next);
  };

  return (
    <label
      onClick={toggle}
      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer select-none group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <motion.div
          animate={{
            scale: checked ? 1 : 0.9,
            backgroundColor: checked ? "#10b981" : "transparent",
            borderColor: checked ? "#10b981" : "#71717a",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="w-5 h-5 rounded-md border-2 flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5 text-zinc-950" viewBox="0 0 14 14" fill="none">
            <motion.path
              d="M2.5 7L5.5 10L11.5 3.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{
                pathLength: checked ? 1 : 0,
                opacity: checked ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </svg>
        </motion.div>
      </div>

      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}
