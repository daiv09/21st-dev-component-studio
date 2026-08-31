"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const RAIL_ITEMS = [
  { id: "1", title: "PRO", color: "bg-indigo-600 text-white" },
  { id: "2", title: "STUDIO", color: "bg-emerald-500 text-zinc-950" },
  { id: "3", title: "ENTERPRISE", color: "bg-amber-400 text-zinc-950" },
];

export function KineticFocusRailBlock() {
  const [activeId, setActiveId] = useState("2");

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 w-full h-24 p-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        {RAIL_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <motion.div
              key={item.id}
              onClick={() => setActiveId(item.id)}
              onMouseEnter={() => setActiveId(item.id)}
              animate={{ flex: isActive ? 3 : 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className={`h-full rounded-xl ${item.color} p-2 flex flex-col justify-between cursor-pointer overflow-hidden shadow-md`}
            >
              <span className="font-mono text-[10px] font-bold opacity-80">0{item.id}</span>
              <span className="font-mono text-xs font-black truncate">{item.title}</span>
            </motion.div>
          );
        })}
      </div>
      <span className="text-[10px] font-mono text-zinc-400">HOVER TO EXPAND RAIL TRACK</span>
    </div>
  );
}
