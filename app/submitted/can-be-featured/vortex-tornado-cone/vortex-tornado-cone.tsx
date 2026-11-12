"use client";

import React from "react";
import { motion } from "framer-motion";

// A conical vortex (funnel) of stacked horizontal rings of decreasing
// radius. Each ring rotates out of phase with the next, creating a
// swirling tornado. Bottom is wide, top is narrow.
export default function VortexTornadoCone() {
    const N = 18;
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-900 dark:to-slate-800 overflow-hidden flex items-center justify-center">
            <div className="relative w-64 h-64">
                {Array.from({ length: N }).map((_, i) => {
                    const t = i / (N - 1); // 0 top -> 1 bottom
                    const r = 12 + t * 100;
                    const y = t * 240;
                    return (
                        <motion.div
                            key={i}
                            className="absolute left-1/2 border-2 border-cyan-700/60 dark:border-cyan-300/60 rounded-full"
                            style={{
                                width: r * 2,
                                height: r * 0.4,
                                top: y,
                                transform: "translateX(-50%)",
                            }}
                            animate={{ rotateX: 60, rotateZ: [0, 360] }}
                            transition={{
                                duration: 2 + i * 0.1,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 0.05,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
