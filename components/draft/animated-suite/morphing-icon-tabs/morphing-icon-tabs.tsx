"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Grid, Layers, Cpu, Zap } from "lucide-react";

export function MorphingIconTabs() {
  const [activeTab, setActiveTab] = useState("grid");

  const tabs = [
    { id: "grid", icon: Grid, label: "Grid" },
    { id: "layers", icon: Layers, label: "Layers" },
    { id: "cpu", icon: Cpu, label: "Compute" },
    { id: "zap", icon: Zap, label: "Energy" },
  ];

  return (
    <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive
                ? "text-zinc-950 dark:text-zinc-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="morph-tab"
                className="absolute inset-0 bg-emerald-400 rounded-xl shadow-sm -z-0"
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              />
            )}
            <tab.icon className="w-4 h-4 z-10" />
            <span className="z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
