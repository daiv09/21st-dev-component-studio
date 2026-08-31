"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface Option {
  id: string;
  label: string;
}

interface ElasticToggleGroupProps {
  options?: Option[];
  initialId?: string;
  onChange?: (id: string) => void;
}

const DEFAULT_OPTIONS: Option[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export function ElasticToggleGroup({
  options = DEFAULT_OPTIONS,
  initialId = "week",
  onChange,
}: ElasticToggleGroupProps) {
  const [activeId, setActiveId] = useState(initialId);

  const handleSelect = (id: string) => {
    setActiveId(id);
    onChange?.(id);
  };

  return (
    <div className="flex items-center p-1.5 rounded-2xl bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 select-none">
      {options.map((opt) => {
        const isActive = opt.id === activeId;
        return (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className={`relative px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors duration-200 ${
              isActive
                ? "text-zinc-950 dark:text-zinc-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="elastic-pill"
                className="absolute inset-0 bg-emerald-400 rounded-xl shadow-sm -z-0"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 32,
                }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
