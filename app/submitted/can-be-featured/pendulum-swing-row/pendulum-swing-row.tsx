"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, MotionValue } from "framer-motion";

// 5 pendulums in a row with different lengths. The bobs swing side to side
// with periods that sync and unsync over time.
const N = 5;
const LENGTHS = [1.0, 1.4, 0.7, 1.2, 0.9];
const COLORS = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
];

function Pendulum({ i, driver }: { i: number; driver: MotionValue<number> }) {
    const len = 80 + (i % 3) * 30;
    const rot = useTransform(driver, (v) => `${v}deg`);
    return (
        <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-neutral-700 dark:bg-neutral-300" />
            <motion.div
                className="w-px bg-neutral-700 dark:bg-neutral-300 origin-top"
                style={{ height: len, rotate: rot }}
            />
            <div className={`w-5 h-5 rounded-full ${COLORS[i]} -mt-2.5 shadow-md`} />
        </div>
    );
}

export default function PendulumSwingRow() {
    const d0 = useMotionValue(0);
    const d1 = useMotionValue(0);
    const d2 = useMotionValue(0);
    const d3 = useMotionValue(0);
    const d4 = useMotionValue(0);
    const drivers = [d0, d1, d2, d3, d4];

    useEffect(() => {
        let raf = 0;
        let t = 0;
        const render = () => {
            t += 1;
            for (let i = 0; i < N; i++) {
                const a = Math.sin((t * 0.025) / LENGTHS[i]) * 28;
                drivers[i].set(a);
            }
            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex items-start justify-center pt-6">
            <div className="flex items-start gap-6">
                {drivers.map((d, i) => (
                    <Pendulum key={i} i={i} driver={d} />
                ))}
            </div>
        </div>
    );
}
