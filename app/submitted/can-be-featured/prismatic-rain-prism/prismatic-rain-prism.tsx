"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animated vertical "rain" of particles falling through a triangular prism
// in the middle and exiting as 3 colored beams.
export default function PrismaticRainPrism() {
    const [drops, setDrops] = useState<{ id: number; x: number; delay: number }[]>([]);

    useEffect(() => {
        let id = 0;
        const iv = setInterval(() => {
            id++;
            const x = 5 + Math.random() * 30; // left third (above prism)
            const d = { id, x, delay: 0 };
            setDrops((arr) => [...arr.slice(-15), d]);
            setTimeout(() => {
                setDrops((arr) => arr.filter((p) => p.id !== d.id));
            }, 2400);
        }, 250);
        return () => clearInterval(iv);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
            {/* beams */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                {/* prism (triangle) */}
                <polygon
                    points="50,40 65,70 35,70"
                    fill="url(#prismGrad)"
                    opacity="0.4"
                />
                <defs>
                    <linearGradient id="prismGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a5f3fc" />
                        <stop offset="100%" stopColor="#f9a8d4" />
                    </linearGradient>
                    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                </defs>
                {/* 3 refracted beams exiting bottom */}
                {[45, 50, 55].map((x, i) => (
                    <line
                        key={i}
                        x1={x}
                        y1="70"
                        x2={x - 15 + i * 15}
                        y2="100"
                        stroke={
                            i === 0 ? "#f87171" : i === 1 ? "#fde68a" : "#a5b4fc"
                        }
                        strokeWidth="1.4"
                        opacity="0.7"
                    />
                ))}
            </svg>

            <AnimatePresence>
                {drops.map((d) => (
                    <motion.div
                        key={d.id}
                        className="absolute w-1 h-3 rounded-full bg-sky-400"
                        style={{ left: `${d.x}%`, top: 0 }}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: "40%", opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "linear" }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
