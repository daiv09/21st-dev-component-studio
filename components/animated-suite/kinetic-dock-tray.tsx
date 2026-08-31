"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Bell, Shield, Radio } from "lucide-react";

export function KineticDockTray() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        <motion.button
          onClick={() => setOpen(!open)}
          animate={{ rotate: open ? 45 : 0 }}
          className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shadow-md"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </motion.button>

        <motion.div
          animate={{ width: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          className="flex items-center gap-1.5 overflow-hidden"
        >
          {[Bell, Shield, Radio].map((Icon, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.15 }}
              className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center justify-center cursor-pointer"
            >
              <Icon className="w-4 h-4" />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <span className="text-[10px] font-mono text-zinc-400">CLICK TO EJECT TRAY</span>
    </div>
  );
}
