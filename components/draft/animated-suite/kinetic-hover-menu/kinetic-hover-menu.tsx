"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "projects", label: "Projects" },
  { id: "settings", label: "Settings" },
];

export function KineticHoverMenu() {
  const [activeId, setActiveId] = useState("dashboard");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const currentHighlight = hoveredId || activeId;

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px] p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md select-none relative">
      {MENU_ITEMS.map((item) => {
        const isHighlighted = currentHighlight === item.id;
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveId(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`relative px-4 py-2 rounded-xl text-left text-xs font-bold transition-colors z-10 ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {isHighlighted && (
              <motion.div
                layoutId="menu-highlight"
                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
