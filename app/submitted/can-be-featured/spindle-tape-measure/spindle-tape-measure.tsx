"use client";

import React from "react";
import { motion } from "framer-motion";

// A measuring tape being pulled out and retracted. The tape shows tick
// marks that scroll. Use a clipped mask to reveal/hide segments.
export default function SpindleTapeMeasure() {
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-amber-50 dark:bg-neutral-950 overflow-hidden flex items-center justify-center">
            <div className="relative w-72 h-20 bg-amber-200 dark:bg-amber-900 rounded-md border-2 border-amber-700 dark:border-amber-300 flex items-center overflow-hidden">
                {/* tick marks (scrolls) */}
                <motion.div
                    className="flex h-full"
                    animate={{ x: [0, -80] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                    {Array.from({ length: 24 }).map((_, i) => {
                        const long = i % 5 === 0;
                        return (
                            <div
                                key={i}
                                className="relative w-8 h-full flex flex-col items-center"
                            >
                                <div
                                    className={`w-px bg-amber-800 dark:bg-amber-200 ${
                                        long ? "h-4" : "h-2"
                                    }`}
                                />
                                {long && (
                                    <div className="text-[10px] text-amber-900 dark:text-amber-100 font-mono">
                                        {i}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </motion.div>
                {/* clip mask for left/right */}
                <div className="absolute inset-y-0 left-0 w-2 bg-amber-700 dark:bg-amber-300" />
                <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-amber-200 dark:from-amber-900 to-transparent" />
            </div>
        </div>
    );
}
