"use client";

import React from "react";
import { motion } from "framer-motion";

// Two circles (reels) connected by a strip of "tape" between them. One
// reel rotates clockwise, the other counter-clockwise; the tape undulates
// between them. A small data dot travels along the tape.
export default function CosmicTapeReel() {
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-950 dark:to-fuchsia-950 overflow-hidden flex items-center justify-center">
            <div className="relative w-72 h-32 flex items-center justify-between">
                {/* left reel */}
                <motion.div
                    className="w-24 h-24 rounded-full border-4 border-indigo-700 dark:border-indigo-300 relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-400" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-1/2 top-1/2 w-px h-10 bg-indigo-400"
                            style={{
                                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                            }}
                        />
                    ))}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-700 dark:bg-indigo-300" />
                </motion.div>

                {/* tape (undulating line) */}
                <svg
                    className="absolute inset-x-12 top-1/2 -translate-y-1/2 w-48 h-12 pointer-events-none"
                    viewBox="0 0 200 50"
                >
                    <motion.path
                        d="M0 25 Q 50 5 100 25 T 200 25"
                        fill="none"
                        stroke="currentColor"
                        className="text-fuchsia-500 dark:text-fuchsia-300"
                        strokeWidth={6}
                        animate={{
                            d: [
                                "M0 25 Q 50 5 100 25 T 200 25",
                                "M0 25 Q 50 45 100 25 T 200 25",
                                "M0 25 Q 50 5 100 25 T 200 25",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* data dot */}
                    <motion.circle
                        r={4}
                        fill="#fde68a"
                        animate={{
                            cx: [0, 200],
                            cy: [25, 25],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>

                {/* right reel */}
                <motion.div
                    className="w-24 h-24 rounded-full border-4 border-fuchsia-700 dark:border-fuchsia-300 relative"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute inset-2 rounded-full border-2 border-fuchsia-400" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-1/2 top-1/2 w-px h-10 bg-fuchsia-400"
                            style={{
                                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                            }}
                        />
                    ))}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-fuchsia-700 dark:bg-fuchsia-300" />
                </motion.div>
            </div>
        </div>
    );
}
