"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

// A toggle whose thumb, when toggled, "sprouts" a small leaf that grows
// and fades. On the off state the leaf is hidden.
export default function TogglePulseSprout() {
    const [on, setOn] = useState(false);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex items-center justify-center">
            <button
                onClick={() => setOn((v) => !v)}
                className={`relative w-32 h-16 rounded-full p-1 transition-colors duration-500 ${
                    on
                        ? "bg-gradient-to-r from-emerald-400 to-green-500"
                        : "bg-neutral-300 dark:bg-neutral-800"
                }`}
            >
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center"
                    style={{ marginLeft: on ? "auto" : 0 }}
                >
                    <AnimatePresence>
                        {on && (
                            <motion.div
                                key="leaf"
                                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                exit={{ scale: 0, rotate: 90, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 14,
                                }}
                            >
                                <Leaf className="w-6 h-6 text-emerald-600" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                    {on && (
                        <motion.div
                            key="sprout"
                            initial={{ scale: 0, y: 0, opacity: 0 }}
                            animate={{ scale: 1.2, y: -30, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="absolute left-1/2 -translate-x-1/2 top-2"
                        >
                            <Leaf className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
}
