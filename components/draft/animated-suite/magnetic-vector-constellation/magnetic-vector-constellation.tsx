"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export function MagneticVectorConstellation() {
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = [
    { x: 20, y: 20 },
    { x: 80, y: 25 },
    { x: 50, y: 75 },
    { x: 25, y: 70 },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursor({ x, y });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-crosshair overflow-hidden shadow-xl"
      >
        <svg className="w-full h-full">
          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              <line
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${cursor.x}%`}
                y2={`${cursor.y}%`}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle cx={`${node.x}%`} cy={`${node.y}%`} r="4" fill="#818cf8" />
            </React.Fragment>
          ))}
          <motion.circle
            cx={`${cursor.x}%`}
            cy={`${cursor.y}%`}
            r="6"
            fill="#34d399"
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
          />
        </svg>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        VECTOR CONSTELLATION MESH
      </span>
    </div>
  );
}
