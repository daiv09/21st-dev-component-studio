"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Server, Database } from "lucide-react";

export function OrbitalSystemWidget() {
  const [activeNode, setActiveNode] = useState("CORE SYSTEM");

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Orbit track */}
        <div className="absolute inset-0 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700" />

        {/* Orbiting Satellites */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0"
        >
          {/* Satellite 1: Server */}
          <div
            onClick={() => setActiveNode("PRIMARY SERVER")}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
          >
            <Server className="w-4 h-4" />
          </div>

          {/* Satellite 2: Database */}
          <div
            onClick={() => setActiveNode("REDIS DATABASE")}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
          >
            <Database className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Center Node */}
        <div
          onClick={() => setActiveNode("CORE SYSTEM")}
          className="w-12 h-12 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-xl border-2 border-zinc-200 dark:border-zinc-800 cursor-pointer"
        >
          <Cpu className="w-6 h-6" />
        </div>
      </div>

      <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
        {activeNode}
      </span>
    </div>
  );
}
