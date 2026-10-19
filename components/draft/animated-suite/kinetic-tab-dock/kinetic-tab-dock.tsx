"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layout, Compass, Shield, Zap } from "lucide-react";

export function KineticTabDock() {
  const [activeTab, setActiveTab] = useState("layout");

  const tabs = [
    { id: "layout", icon: Layout },
    { id: "compass", icon: Compass },
    { id: "shield", icon: Shield },
    { id: "zap", icon: Zap },
  ];

  return (
    <div className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative p-3 rounded-xl transition-colors ${
              isActive ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="spatial-dock-pill"
                className="absolute inset-0 bg-emerald-400 rounded-xl shadow-md -z-0"
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
              />
            )}
            <tab.icon className="w-5 h-5 z-10 relative stroke-[2.5]" />
          </button>
        );
      })}
    </div>
  );
}
