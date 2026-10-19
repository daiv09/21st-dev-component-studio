"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Box } from "lucide-react";

export function Origami3dFoldCard() {
  const [isFolded, setIsFolded] = useState(false);

  return (
    <div
      onClick={() => setIsFolded(!isFolded)}
      className="perspective-1000 select-none p-2"
    >
      <motion.div
        animate={{ rotateX: isFolded ? 40 : 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="w-64 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-3 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Origami Fold
            </span>
          </div>
          <span className="text-[10px] font-mono text-violet-500 font-bold">
            {isFolded ? "FOLDED" : "OPEN"}
          </span>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Click to trigger 3D origami paper fold perspective.
        </p>
      </motion.div>
    </div>
  );
}
