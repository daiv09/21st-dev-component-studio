"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Small ember sparks rise from the bottom in looping random paths,
// fading as they rise.
interface Spark {
    id: number;
    x: number;
    delay: number;
    duration: number;
    sway: number;
    hue: number;
}

export default function EmberSparkTrail() {
    const [sparks, setSparks] = useState<Spark[]>([]);
    const idRef = useState({ current: 0 })[0];

    useEffect(() => {
        const iv = setInterval(() => {
            idRef.current += 1;
            const s: Spark = {
                id: idRef.current,
                x: Math.random() * 100,
                delay: 0,
                duration: 2.5 + Math.random() * 2,
                sway: (Math.random() - 0.5) * 40,
                hue: 20 + Math.random() * 30,
            };
            setSparks((arr) => [...arr.slice(-30), s]);
            setTimeout(() => {
                setSparks((arr) => arr.filter((p) => p.id !== s.id));
            }, (s.duration + 0.3) * 1000);
        }, 220);
        return () => clearInterval(iv);
    }, [idRef]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-900 via-rose-950 to-orange-950 overflow-hidden">
            {/* base log glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-2 rounded-full bg-amber-700 blur-md" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-amber-300" />

            <AnimatePresence>
                {sparks.map((s) => (
                    <motion.div
                        key={s.id}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                            left: `${s.x}%`,
                            bottom: 0,
                            background: `hsl(${s.hue}, 90%, 65%)`,
                            boxShadow: `0 0 8px hsl(${s.hue}, 90%, 65%)`,
                        }}
                        initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                        animate={{
                            y: -260,
                            x: s.sway,
                            opacity: 0,
                            scale: 0.3,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: s.duration, ease: "easeOut" }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
