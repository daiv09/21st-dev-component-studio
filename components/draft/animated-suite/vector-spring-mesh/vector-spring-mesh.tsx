"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VectorSpringMesh() {
  const [pull, setPull] = useState({ x: 0, y: 0 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-xl">
        <svg className="w-full h-full p-2">
          {/* Elastic Mesh Lines */}
          <motion.path
            d={`M 10,50 Q ${50 + pull.x},${50 + pull.y} 90,50`}
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
          />
          <motion.path
            d={`M 50,10 Q ${50 + pull.x},${50 + pull.y} 50,90`}
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
          />
        </svg>

        {/* Draggable Central Node */}
        <motion.div
          drag
          dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
          dragSnapToOrigin
          onDrag={(_, info) => setPull({ x: info.offset.x, y: info.offset.y })}
          onDragEnd={() => setPull({ x: 0, y: 0 })}
          className="absolute w-8 h-8 rounded-full bg-emerald-400 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing"
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        DRAG NODE TO STRETCH MESH
      </span>
    </div>
  );
}
