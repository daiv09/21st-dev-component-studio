"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// A vinyl record with concentric grooves (CSS radial gradients) and a center
// label. Spins slowly. On hover, a tone-arm extends in and the spin speeds up.
export default function ChromaticVinylSpinner() {
    const [hover, setHover] = useState(false);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-amber-50 dark:bg-neutral-950 overflow-hidden flex items-center justify-center"
        >
            <div className="relative w-56 h-56">
                {/* record */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: hover
                            ? "repeating-radial-gradient(circle at center, #0f172a 0 2px, #1e293b 2px 4px)"
                            : "repeating-radial-gradient(circle at center, #1e293b 0 2px, #0f172a 2px 4px)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: hover ? 2 : 6,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    {/* label */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black" />
                    </div>
                    {/* shine */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                </motion.div>

                {/* tone arm */}
                <motion.div
                    className="absolute right-0 top-2 w-2 h-28 bg-neutral-700 dark:bg-neutral-300 origin-top rounded-full"
                    initial={{ rotate: -45 }}
                    animate={{ rotate: hover ? 25 : -45 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                    style={{ transformOrigin: "top right" }}
                >
                    <div className="absolute -bottom-2 -left-1.5 w-5 h-5 rounded-sm bg-amber-700 dark:bg-amber-300" />
                </motion.div>
            </div>
        </div>
    );
}
