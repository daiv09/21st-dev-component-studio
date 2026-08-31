"use client";

import React from "react";
import { motion } from "framer-motion";

// 5 paper airplane SVG paths flying in formation across the card, looping.
// Each has a slight rotation + phase offset. A thin trail line behind each.
export default function PaperAirplaneFleet() {
    const N = 5;
    const planes = Array.from({ length: N }).map((_, i) => ({
        delay: i * 0.4,
        y: 30 + i * 30,
        scale: 0.9 + i * 0.04,
    }));

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-sky-200 to-sky-400 dark:from-sky-900 dark:to-indigo-950 overflow-hidden">
            {planes.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{ top: p.y }}
                    initial={{ x: -60, rotate: -10 }}
                    animate={{
                        x: ["-10%", "110%"],
                        y: [0, -6, 4, -2, 0],
                        rotate: [-10, -6, -14, -8, -10],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                >
                    <svg width={40 * p.scale} height={20 * p.scale} viewBox="0 0 40 20">
                        <polygon
                            points="2,10 38,2 30,12"
                            fill="#f1f5f9"
                            stroke="#0f172a"
                            strokeWidth={0.8}
                        />
                        <polygon
                            points="2,10 30,12 22,18"
                            fill="#cbd5e1"
                            stroke="#0f172a"
                            strokeWidth={0.8}
                        />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
}
