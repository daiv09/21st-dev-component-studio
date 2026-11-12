"use client";

import React from "react";
import { motion } from "framer-motion";

// 3 SVG paper sheets that periodically fold (rotateY 0->60->0) in sequence
// in a 3D perspective parent.
export default function OrigamiFoldCurl() {
    const sheets = [
        { color: "from-rose-300 to-rose-500", delay: 0 },
        { color: "from-amber-300 to-amber-500", delay: 0.5 },
        { color: "from-violet-300 to-violet-500", delay: 1.0 },
    ];

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex items-center justify-center [perspective:800px]">
            <div className="relative w-64 h-40 [transform-style:preserve-3d]">
                {sheets.map((s, i) => (
                    <motion.div
                        key={i}
                        className={`absolute inset-0 rounded-lg bg-gradient-to-br ${s.color} shadow-md`}
                        animate={{ rotateY: [0, 60, 0], rotateX: [0, 4, 0] }}
                        transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            repeatDelay: 1.4,
                            delay: s.delay,
                            ease: "easeInOut",
                        }}
                        style={{ zIndex: i }}
                    >
                        <div className="absolute inset-0 rounded-lg ring-1 ring-black/10" />
                        <div className="absolute inset-y-0 left-1/2 w-px bg-black/20" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
