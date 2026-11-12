"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// A stack of 5 transparent "glass" cards that cascade in from a slight
// rotation/offset. On hover, the cards fan out and show a prism refraction.
export default function CascadePrismCard() {
    const [hover, setHover] = useState(false);
    const N = 5;

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-950 overflow-hidden flex items-center justify-center"
        >
            <div className="relative w-44 h-56 [perspective:800px]">
                {Array.from({ length: N }).map((_, i) => {
                    const offset = i * 6;
                    return (
                        <motion.div
                            key={i}
                            className="absolute inset-0 rounded-2xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-xl"
                            style={{
                                background: `linear-gradient(135deg, hsl(${(i * 60) % 360}, 80%, 60%, 0.35), hsl(${(i * 60 + 120) % 360}, 80%, 50%, 0.25))`,
                            }}
                            animate={
                                hover
                                    ? {
                                          x: (i - (N - 1) / 2) * 30,
                                          y: (i - (N - 1) / 2) * -8,
                                          rotate: (i - (N - 1) / 2) * 8,
                                          zIndex: i,
                                      }
                                    : {
                                          x: offset,
                                          y: offset,
                                          rotate: (i - (N - 1) / 2) * 3,
                                          zIndex: N - i,
                                      }
                            }
                            transition={{
                                type: "spring",
                                stiffness: 220,
                                damping: 18,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
