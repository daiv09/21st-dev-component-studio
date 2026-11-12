"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// A circular "dish" containing a small blob that slowly deforms its outline
// (animated SVG path morph) and occasionally splits into two blobs that
// drift apart and merge back.
export default function PetriDishBlob() {
    const [split, setSplit] = useState(false);

    React.useEffect(() => {
        const id = setInterval(() => {
            setSplit((v) => !v);
        }, 4000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-stone-100 dark:bg-stone-950 overflow-hidden flex items-center justify-center">
            <div className="relative w-64 h-64 rounded-full border-4 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
                <AnimatePresence>
                    {!split ? (
                        <motion.svg
                            key="one"
                            viewBox="0 0 100 100"
                            className="absolute inset-0 w-full h-full"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                        >
                            <motion.path
                                d="M50 30 C 65 30 70 50 65 60 C 60 70 40 70 35 60 C 30 50 35 30 50 30 Z"
                                fill="#84cc16"
                                animate={{
                                    d: [
                                        "M50 30 C 65 30 70 50 65 60 C 60 70 40 70 35 60 C 30 50 35 30 50 30 Z",
                                        "M50 28 C 70 32 72 55 60 65 C 50 75 35 70 30 55 C 25 40 30 24 50 28 Z",
                                        "M50 30 C 65 30 70 50 65 60 C 60 70 40 70 35 60 C 30 50 35 30 50 30 Z",
                                    ],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </motion.svg>
                    ) : (
                        <>
                            <motion.svg
                                key="a"
                                viewBox="0 0 100 100"
                                className="absolute inset-0 w-full h-full"
                                initial={{ x: 0, scale: 1 }}
                                animate={{ x: -30, scale: 0.6 }}
                                exit={{ x: 0, scale: 1 }}
                                transition={{ duration: 1.6 }}
                            >
                                <circle cx={45} cy={55} r={15} fill="#84cc16" />
                            </motion.svg>
                            <motion.svg
                                key="b"
                                viewBox="0 0 100 100"
                                className="absolute inset-0 w-full h-full"
                                initial={{ x: 0, scale: 1 }}
                                animate={{ x: 30, scale: 0.6 }}
                                exit={{ x: 0, scale: 1 }}
                                transition={{ duration: 1.6 }}
                            >
                                <circle cx={55} cy={45} r={15} fill="#22d3ee" />
                            </motion.svg>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
