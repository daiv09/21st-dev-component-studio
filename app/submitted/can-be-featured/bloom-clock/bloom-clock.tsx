"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// A clock face where the active hour-tick "blooms" and fades, and a
// minute "ring" of small dots fills around the perimeter over 60s.
export default function BloomClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex items-center justify-center">
            <div className="relative w-56 h-56">
                {/* minute ring */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                    {Array.from({ length: 60 }).map((_, i) => {
                        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
                        const x = 100 + Math.cos(a) * 90;
                        const y = 100 + Math.sin(a) * 90;
                        const filled = i < (m + s / 60);
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={i % 5 === 0 ? 2.4 : 1.4}
                                fill={filled ? "#6366f1" : "#cbd5e1"}
                                className={filled ? "" : "dark:fill-neutral-700"}
                            />
                        );
                    })}
                </svg>

                {/* hour ticks */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                    const x = 100 + Math.cos(a) * 65;
                    const y = 100 + Math.sin(a) * 65;
                    const active = i === h;
                    return (
                        <div
                            key={i}
                            className="absolute"
                            style={{
                                left: `${(x / 200) * 100}%`,
                                top: `${(y / 200) * 100}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <AnimatePresence>
                                {active && (
                                    <motion.div
                                        key={i}
                                        className="absolute inset-0 w-6 h-6 -ml-3 -mt-3 rounded-full bg-fuchsia-500/60"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0, 1.6, 1.2], opacity: [0, 0.8, 0.4] }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.9 }}
                                    />
                                )}
                            </AnimatePresence>
                            <div
                                className={`relative w-3 h-3 rounded-full ${
                                    active
                                        ? "bg-fuchsia-500"
                                        : "bg-neutral-300 dark:bg-neutral-700"
                                }`}
                            />
                        </div>
                    );
                })}

                {/* hands */}
                <motion.div
                    className="absolute left-1/2 top-1/2 w-1 h-16 bg-neutral-900 dark:bg-neutral-100 origin-bottom rounded-full"
                    animate={{ rotate: (h + m / 60) * 30 }}
                    transition={{ type: "spring", stiffness: 60, damping: 14 }}
                    style={{ transformOrigin: "50% 100%" }}
                />
                <motion.div
                    className="absolute left-1/2 top-1/2 w-0.5 h-20 bg-indigo-500 origin-bottom rounded-full"
                    animate={{ rotate: m * 6 }}
                    transition={{ type: "spring", stiffness: 60, damping: 14 }}
                    style={{ transformOrigin: "50% 100%" }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-500" />
            </div>
        </div>
    );
}
