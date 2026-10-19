"use client";

import React from "react";
import { motion } from "framer-motion";

// Two intertwined SVG paths (celtic-knot style) that loop in a slow
// seamless rotation. The crossover points appear to weave.
export default function BraidKnotLoop() {
    const R = 80;
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950 dark:to-rose-950 overflow-hidden flex items-center justify-center">
            <svg viewBox="-120 -120 240 240" className="w-64 h-64">
                <defs>
                    <linearGradient id="b1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient id="b2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                </defs>
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "0 0" }}
                >
                    {/* strand 1 (drawn under at first crossings) */}
                    <path
                        d={`M0 -${R} C ${R} -${R} ${R} ${R} 0 ${R} C -${R} ${R} -${R} -${R} 0 -${R}`}
                        fill="none"
                        stroke="url(#b1)"
                        strokeWidth={10}
                        strokeLinecap="round"
                    />
                    {/* strand 2 — drawn over, but with small z-juggling we use dashed overlay tricks */}
                    <path
                        d={`M0 -${R} C -${R} -${R} -${R} ${R} 0 ${R} C ${R} ${R} ${R} -${R} 0 -${R}`}
                        fill="none"
                        stroke="url(#b2)"
                        strokeWidth={10}
                        strokeLinecap="round"
                        strokeDasharray="80 80"
                        strokeDashoffset={40}
                    />
                </motion.g>
            </svg>
        </div>
    );
}
