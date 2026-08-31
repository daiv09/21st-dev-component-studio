"use client";

import React from "react";
import { motion } from "framer-motion";

// A vertical chain of 6 SVG chain links. Each link sways slightly with a
// phase delay from the top.
export default function ChainLinkGlow() {
    const N = 6;
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-950 overflow-hidden flex items-center justify-center">
            <div className="flex flex-col items-center">
                {Array.from({ length: N }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="-my-2"
                        style={{ transformOrigin: "50% 0%" }}
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.18,
                            ease: "easeInOut",
                        }}
                    >
                        <svg width={48} height={24} viewBox="0 0 48 24">
                            <ellipse
                                cx={24}
                                cy={12}
                                rx={20}
                                ry={9}
                                fill="none"
                                stroke="currentColor"
                                className="text-amber-500 dark:text-amber-300"
                                strokeWidth={3}
                            />
                        </svg>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
