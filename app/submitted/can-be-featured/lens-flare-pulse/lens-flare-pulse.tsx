"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// A circle "lens" in the center that emits a soft pulsing light flare
// (animated box-shadow) and a couple of "spec" dots. Click to "shoot".
export default function LensFlarePulse() {
    const [shot, setShot] = useState(0);

    return (
        <div
            onClick={() => setShot((v) => v + 1)}
            className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-indigo-950 via-violet-950 to-fuchsia-950 overflow-hidden flex items-center justify-center cursor-pointer"
        >
            {/* spec dots */}
            {[
                { x: 30, y: 25, c: "#fde68a" },
                { x: 75, y: 20, c: "#f9a8d4" },
                { x: 22, y: 78, c: "#a5f3fc" },
                { x: 80, y: 75, c: "#c4b5fd" },
            ].map((s, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: 6,
                        height: 6,
                        background: s.c,
                        boxShadow: `0 0 12px ${s.c}`,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                    }}
                />
            ))}

            <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 via-rose-300 to-violet-400"
                animate={{
                    boxShadow: [
                        "0 0 30px 5px rgba(244,114,182,0.4)",
                        "0 0 60px 12px rgba(168,85,247,0.55)",
                        "0 0 30px 5px rgba(244,114,182,0.4)",
                    ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />

            <AnimatePresence>
                {shot > 0 && (
                    <motion.div
                        key={shot}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white"
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
