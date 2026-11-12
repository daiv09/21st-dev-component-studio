"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

// A centered star that, on click, emits a burst of 12 small sparkle
// particles radially outward, each fading and shrinking.
interface Sparkle {
    id: number;
    angle: number;
    dist: number;
    color: string;
}

const COLORS = [
    "#fde68a",
    "#f9a8d4",
    "#a5b4fc",
    "#67e8f9",
    "#86efac",
    "#fdba74",
];

export default function SparkleEmberBurst() {
    const [burst, setBurst] = useState<{ id: number; sparks: Sparkle[] } | null>(null);

    const fire = () => {
        const id = Date.now();
        const sparks: Sparkle[] = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            angle: (i / 12) * Math.PI * 2,
            dist: 70 + Math.random() * 30,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }));
        setBurst({ id, sparks });
        setTimeout(() => setBurst(null), 900);
    };

    return (
        <div
            onClick={fire}
            className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950 overflow-hidden flex items-center justify-center cursor-pointer"
        >
            <motion.div
                className="relative"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
                <Star className="w-12 h-12 fill-amber-300 text-amber-500" />
            </motion.div>

            <AnimatePresence>
                {burst &&
                    burst.sparks.map((s) => (
                        <motion.div
                            key={`${burst.id}-${s.id}`}
                            className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
                            style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
                            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                            animate={{
                                x: Math.cos(s.angle) * s.dist,
                                y: Math.sin(s.angle) * s.dist,
                                scale: 0,
                                opacity: 0,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    ))}
            </AnimatePresence>
        </div>
    );
}
