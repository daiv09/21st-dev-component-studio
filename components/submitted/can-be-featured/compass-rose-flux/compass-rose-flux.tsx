"use client";

import React from "react";
import { motion } from "framer-motion";

// A compass rose that rotates with a slight wobble. The N pointer is fixed
// while the rose rotates; a small magnetic deviation drifts N ±5°.
export default function CompassRoseFlux() {
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-rose-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-950 overflow-hidden flex items-center justify-center">
            <div className="relative w-56 h-56 rounded-full border-2 border-neutral-300 dark:border-neutral-700">
                {/* ticks */}
                {Array.from({ length: 60 }).map((_, i) => {
                    const a = (i / 60) * Math.PI * 2;
                    const long = i % 5 === 0;
                    return (
                        <div
                            key={i}
                            className="absolute left-1/2 top-1/2 origin-bottom"
                            style={{
                                transform: `translate(-50%, -100%) rotate(${(a * 180) / Math.PI}deg)`,
                                height: long ? 12 : 6,
                                width: 1.5,
                                background: "currentColor",
                            }}
                        />
                    );
                })}

                {/* rotating rose */}
                <motion.div
                    className="absolute inset-6"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    {["N", "E", "S", "W"].map((d, i) => {
                        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
                        const x = Math.cos(a) * 80;
                        const y = Math.sin(a) * 80;
                        return (
                            <div
                                key={d}
                                className="absolute left-1/2 top-1/2 text-sm font-bold text-neutral-700 dark:text-neutral-300"
                                style={{
                                    transform: `translate(${x - 8}px, ${y - 8}px)`,
                                }}
                            >
                                {d}
                            </div>
                        );
                    })}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[60px] border-l-transparent border-r-transparent border-b-rose-500" />
                        <div className="absolute w-0 h-0 border-l-[8px] border-r-[8px] border-t-[60px] border-l-transparent border-r-transparent border-t-neutral-700 dark:border-t-neutral-300 translate-y-[60px]" />
                    </div>
                </motion.div>

                {/* fixed N pointer (red) with magnetic deviation */}
                <motion.div
                    className="absolute left-1/2 top-2 w-1 h-12 bg-rose-500 -translate-x-1/2 rounded-full"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "50% 100%" }}
                />
            </div>
        </div>
    );
}
