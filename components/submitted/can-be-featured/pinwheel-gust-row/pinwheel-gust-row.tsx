"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

// 4 pinwheels spinning at different speeds. Every 4s a "gust" event speeds
// them all up briefly with a spring snap.
export default function PinwheelGustRow() {
    const [gust, setGust] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setGust((v) => v + 1), 4000);
        return () => clearInterval(id);
    }, []);

    const speeds = [8, 6, 10, 7];

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-sky-100 to-emerald-100 dark:from-sky-950 dark:to-emerald-950 overflow-hidden flex items-center justify-center">
            <div className="flex items-center gap-8">
                {speeds.map((s, i) => (
                    <Pinwheel
                        key={i}
                        baseDuration={s}
                        gust={gust}
                        color={["#ef4444", "#f59e0b", "#10b981", "#3b82f6"][i]}
                    />
                ))}
            </div>
        </div>
    );
}

function Pinwheel({
    baseDuration,
    gust,
    color,
}: {
    baseDuration: number;
    gust: number;
    color: string;
}) {
    const controls = useAnimation();

    useEffect(() => {
        if (gust > 0) {
            controls.start({
                rotate: [0, 360 * 4],
                transition: { duration: 0.6, ease: "easeOut" },
            });
        }
    }, [gust, controls]);

    return (
        <div className="relative w-20 h-20">
            {/* stem */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-10 bg-emerald-700 dark:bg-emerald-300" />
            {/* spinning blades */}
            <motion.div
                animate={controls}
                className="absolute inset-0"
                style={{ transformOrigin: "50% 50%" }}
            >
                {[0, 90, 180, 270].map((a) => (
                    <div
                        key={a}
                        className="absolute left-1/2 top-1/2 origin-bottom"
                        style={{
                            width: 12,
                            height: 32,
                            transform: `translate(-50%, -100%) rotate(${a}deg)`,
                            background: `linear-gradient(to top, ${color}, ${color}aa)`,
                            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        }}
                    />
                ))}
            </motion.div>
            {/* hub */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-700 dark:bg-amber-300 z-10" />
            {/* idle continuous spin */}
            <IdleSpin duration={baseDuration} />
        </div>
    );
}

function IdleSpin({ duration }: { duration: number }) {
    return (
        <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
        />
    );
}
