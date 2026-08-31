"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface RotaryVolumeKnobProps {
  initialValue?: number; // 0 to 100
  onChange?: (val: number) => void;
}

export function RotaryVolumeKnob({
  initialValue = 65,
  onChange,
}: RotaryVolumeKnobProps) {
  const [value, setValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateAngle(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateAngle(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const updateAngle = (e: React.PointerEvent) => {
    if (!knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    let rad = Math.atan2(dy, dx);
    let deg = rad * (180 / Math.PI) + 90; // normalize top to 0 deg
    if (deg < 0) deg += 360;

    // Map 225 deg span (-135 to +135) to 0-100
    // deg 225..315 is deadzone at top back
    let percentage = 0;
    if (deg >= 225 && deg <= 360) {
      percentage = 0;
    } else if (deg >= 0 && deg <= 135) {
      percentage = Math.round(((deg + 135) / 270) * 100);
    } else if (deg > 135 && deg < 225) {
      percentage = 100;
    }

    const clamped = Math.max(0, Math.min(100, percentage));
    setValue(clamped);
    onChange?.(clamped);
  };

  // Convert 0-100 to angle (-135deg to +135deg)
  const angle = (value / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 select-none">
      <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-600 dark:text-zinc-400">
        {value === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
        <span>OUTPUT: {value}%</span>
      </div>

      <div
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-28 h-28 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        {/* Outer tick marks */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => {
            const tickAngle = (i / 14) * 270 - 135;
            const isActive = tickAngle <= angle;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-0.5 h-2 -translate-x-1/2 origin-[50%_48px]"
                style={{ transform: `rotate(${tickAngle}deg) translateY(-48px)` }}
              >
                <div
                  className={`w-full h-full rounded-full transition-colors duration-150 ${
                    isActive
                      ? "bg-indigo-500 shadow-[0_0_6px_#6366f1]"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Knob Body */}
        <motion.div
          className="relative w-20 h-20 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-lg flex items-center justify-center"
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Top Notch Indicator */}
          <div className="absolute top-2 w-1.5 h-4 bg-indigo-500 rounded-full shadow-sm" />
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
        </motion.div>
      </div>
    </div>
  );
}
