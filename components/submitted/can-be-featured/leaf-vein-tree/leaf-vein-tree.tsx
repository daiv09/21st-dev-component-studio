"use client";

import React from "react";
import { motion } from "framer-motion";

// An SVG leaf with a complex vein pattern; the leaf slowly rotates while
// the veins subtly "light up" in a flowing pattern.
export default function LeafVeinTree() {
    const veins = [
        // main midrib
        { d: "M150 30 L150 250", w: 2 },
        // branches
        { d: "M150 80 Q120 90 90 110", w: 1.2 },
        { d: "M150 80 Q180 90 210 110", w: 1.2 },
        { d: "M150 130 Q115 145 80 170", w: 1.2 },
        { d: "M150 130 Q185 145 220 170", w: 1.2 },
        { d: "M150 180 Q125 195 100 220", w: 1 },
        { d: "M150 180 Q175 195 200 220", w: 1 },
    ];

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-emerald-50 dark:bg-emerald-950 overflow-hidden flex items-center justify-center">
            <motion.svg
                viewBox="0 0 300 280"
                className="w-64 h-64"
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* leaf body */}
                <path
                    d="M150 20 C 230 60 230 220 150 260 C 70 220 70 60 150 20 Z"
                    fill="currentColor"
                    className="text-emerald-300 dark:text-emerald-700"
                    opacity={0.6}
                />
                {veins.map((v, i) => (
                    <motion.path
                        key={i}
                        d={v.d}
                        fill="none"
                        stroke="currentColor"
                        className="text-emerald-700 dark:text-emerald-300"
                        strokeWidth={v.w}
                        strokeLinecap="round"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: i * 0.25,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </motion.svg>
        </div>
    );
}
