"use client";

import React from "react";
import { motion } from "framer-motion";

// A small circuit-board SVG: nodes connected by lines. A "pulse" dot
// travels along each line on a staggered schedule.
export default function CircuitPulseRouter() {
    const nodes = [
        { x: 50, y: 40 },
        { x: 130, y: 70 },
        { x: 70, y: 130 },
        { x: 170, y: 150 },
        { x: 230, y: 90 },
        { x: 250, y: 170 },
    ];
    const links = [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
        [1, 4],
        [3, 4],
        [4, 5],
    ];

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-amber-50 dark:bg-neutral-950 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 300 200" className="w-full h-full">
                {links.map(([a, b], i) => (
                    <line
                        key={i}
                        x1={nodes[a].x}
                        y1={nodes[a].y}
                        x2={nodes[b].x}
                        y2={nodes[b].y}
                        stroke="currentColor"
                        className="text-emerald-700 dark:text-emerald-400"
                        strokeWidth={1.4}
                    />
                ))}
                {nodes.map((n, i) => (
                    <g key={i}>
                        <circle
                            cx={n.x}
                            cy={n.y}
                            r={5}
                            fill="currentColor"
                            className="text-emerald-700 dark:text-emerald-400"
                        />
                        <circle
                            cx={n.x}
                            cy={n.y}
                            r={9}
                            fill="none"
                            stroke="currentColor"
                            className="text-emerald-700 dark:text-emerald-400"
                            strokeWidth={1}
                            opacity={0.4}
                        />
                    </g>
                ))}
                {links.map(([a, b], i) => {
                    const A = nodes[a];
                    const B = nodes[b];
                    return (
                        <motion.circle
                            key={`pulse-${i}`}
                            r={3}
                            fill="#10b981"
                            initial={{ cx: A.x, cy: A.y, opacity: 0 }}
                            animate={{
                                cx: [A.x, B.x, B.x],
                                cy: [A.y, B.y, B.y],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeInOut",
                            }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
