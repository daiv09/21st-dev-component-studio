"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// A flat SVG crane that "unfolds" — animates from a single square into
// the crane shape via path morphing (simplified). Loop with a pause.
export default function CraneFoldOrigami() {
    const [phase, setPhase] = useState(0); // 0 = square, 1 = crane

    useEffect(() => {
        const id = setInterval(() => {
            setPhase((p) => (p === 0 ? 1 : 0));
        }, 3500);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-rose-50 to-rose-100 dark:from-rose-950 dark:to-neutral-950 overflow-hidden flex items-center justify-center">
            <motion.svg
                viewBox="0 0 200 200"
                className="w-48 h-48"
                animate={{ rotate: phase === 1 ? [0, 360] : 0 }}
                transition={{ duration: 3, ease: "easeInOut" }}
            >
                <defs>
                    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>
                {phase === 0 ? (
                    // square
                    <motion.rect
                        key="sq"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 12,
                        }}
                        x="40"
                        y="40"
                        width="120"
                        height="120"
                        fill="url(#paper)"
                        stroke="#9a3412"
                        strokeWidth="1.5"
                    />
                ) : (
                    // stylized crane
                    <motion.g
                        key="crane"
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 12,
                        }}
                    >
                        <polygon
                            points="100,40 130,80 100,80"
                            fill="url(#paper)"
                            stroke="#9a3412"
                            strokeWidth="1.2"
                        />
                        <polygon
                            points="100,40 70,80 100,80"
                            fill="#fde68a"
                            stroke="#9a3412"
                            strokeWidth="1.2"
                        />
                        <polygon
                            points="60,90 140,90 130,140 70,140"
                            fill="url(#paper)"
                            stroke="#9a3412"
                            strokeWidth="1.2"
                        />
                        <polygon
                            points="100,140 120,180 80,180"
                            fill="#fb923c"
                            stroke="#9a3412"
                            strokeWidth="1.2"
                        />
                        <polygon
                            points="100,90 70,120 100,140 130,120"
                            fill="#fde68a"
                            stroke="#9a3412"
                            strokeWidth="1.2"
                        />
                        <circle cx="125" cy="50" r="3" fill="#9a3412" />
                    </motion.g>
                )}
            </motion.svg>
        </div>
    );
}
