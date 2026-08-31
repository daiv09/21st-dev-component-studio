"use client";

import React from "react";
import { motion } from "framer-motion";

// A torch SVG hanging from the top, swinging like a pendulum. The flame
// has a small CSS flicker (scale + opacity).
export default function TorchSwingPendulum() {
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-stone-900 to-amber-950 overflow-hidden flex items-start justify-center pt-2">
            <div className="w-1 h-8 bg-stone-600" />
            <motion.div
                className="origin-top w-1"
                style={{ height: 120 }}
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-2 h-2 rounded-full bg-amber-700 mx-auto -mt-1" />
                <svg
                    viewBox="0 0 40 80"
                    className="w-12 h-24 -ml-5 -mt-1"
                >
                    {/* stick */}
                    <rect x="18" y="30" width="4" height="50" fill="#92400e" />
                    {/* flame */}
                    <motion.path
                        d="M20 0 C 8 18 8 30 20 36 C 32 30 32 18 20 0 Z"
                        fill="url(#flame)"
                        animate={{ scale: [1, 1.1, 0.95, 1] }}
                        transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "50% 100%" }}
                    />
                    <defs>
                        <radialGradient id="flame" cx="50%" cy="80%" r="60%">
                            <stop offset="0%" stopColor="#fef3c7" />
                            <stop offset="50%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#dc2626" />
                        </radialGradient>
                    </defs>
                </svg>
            </motion.div>
        </div>
    );
}
