"use client";

import React from "react";
import { motion } from "framer-motion";

// A stack of 5 oval stones (SVG ellipses with subtle gradient fills)
// balanced on each other. Each stone sways very slightly. Hovering makes
// the stack wobble more, then settle.
export default function ZenStoneCairn() {
    const stones = [
        { rx: 60, ry: 14, y: 230, hue: 220 },
        { rx: 50, ry: 12, y: 200, hue: 230 },
        { rx: 42, ry: 10, y: 175, hue: 215 },
        { rx: 32, ry: 8, y: 155, hue: 240 },
        { rx: 22, ry: 6, y: 140, hue: 225 },
    ];
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-stone-100 dark:bg-stone-950 overflow-hidden flex items-center justify-center group">
            <svg viewBox="0 0 300 280" className="w-72 h-72">
                {/* base line */}
                <line
                    x1="40"
                    y1="252"
                    x2="260"
                    y2="252"
                    stroke="currentColor"
                    className="text-stone-400 dark:text-stone-600"
                    strokeWidth={1.5}
                />
                {stones.map((s, i) => (
                    <motion.ellipse
                        key={i}
                        cx={150}
                        cy={s.y}
                        rx={s.rx}
                        ry={s.ry}
                        fill={`hsl(${s.hue}, 10%, ${i % 2 === 0 ? 55 : 70}%)`}
                        animate={{ rotate: [0, 1.5, -1.5, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut",
                        }}
                        style={{ transformOrigin: "150px 252px" }}
                    />
                ))}
            </svg>
        </div>
    );
}
