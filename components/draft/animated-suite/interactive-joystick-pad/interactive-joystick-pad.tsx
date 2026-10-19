"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Move } from "lucide-react";

interface InteractiveJoystickPadProps {
  onChange?: (coords: { x: number; y: number }) => void;
}

export function InteractiveJoystickPad({ onChange }: InteractiveJoystickPadProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const RADIUS = 40;

  const handleDrag = (_: any, info: any) => {
    const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    let x = info.offset.x;
    let y = info.offset.y;

    if (dist > RADIUS) {
      const angle = Math.atan2(y, x);
      x = Math.cos(angle) * RADIUS;
      y = Math.sin(angle) * RADIUS;
    }

    const normX = Math.round((x / RADIUS) * 100);
    const normY = Math.round((-y / RADIUS) * 100); // inverted for classic cartesian

    setPosition({ x: normX, y: normY });
    onChange?.({ x: normX, y: normY });
  };

  const handleDragEnd = () => {
    setPosition({ x: 0, y: 0 });
    onChange?.({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Move className="w-3.5 h-3.5 text-violet-500" />
        <span>X: {position.x} | Y: {position.y}</span>
      </div>

      <div
        ref={containerRef}
        className="relative w-28 h-28 rounded-full bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-inner"
      >
        {/* Crosshair guidelines */}
        <div className="absolute w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 pointer-events-none" />
        <div className="absolute h-full w-0.5 bg-zinc-200 dark:bg-zinc-800 pointer-events-none" />

        {/* Joystick Thumbstick */}
        <motion.div
          drag
          dragConstraints={{ left: -RADIUS, right: RADIUS, top: -RADIUS, bottom: RADIUS }}
          dragElastic={0.1}
          dragSnapToOrigin
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative z-10 w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg shadow-violet-600/30 border-2 border-violet-400"
        >
          <div className="w-4 h-4 rounded-full bg-violet-400/50 border border-white/50" />
        </motion.div>
      </div>
    </div>
  );
}
