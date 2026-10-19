"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Box } from "lucide-react";

export function SpatialParticleCube() {
  const [isRotating, setIsRotating] = useState(true);

  const nodes = Array.from({ length: 16 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Box className="w-3.5 h-3.5 text-emerald-500" />
        <span>3D VOXEL PARTICLE CUBE</span>
      </div>

      <div
        onClick={() => setIsRotating(!isRotating)}
        className="perspective-1000 w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        <motion.div
          animate={{ rotateY: isRotating ? 360 : 0, rotateX: isRotating ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="grid grid-cols-4 gap-2.5 p-2 transform-style-3d"
        >
          {nodes.map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-emerald-400 border border-white shadow-sm"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
