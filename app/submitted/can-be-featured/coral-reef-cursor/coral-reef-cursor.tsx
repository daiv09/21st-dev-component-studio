"use client";

import React, { useEffect, useRef, useState } from "react";

// On mousemove inside the card, leave a small coral polyp that grows
// branches over ~2s, then slowly fades.
interface Polyp {
    id: number;
    x: number;
    y: number;
    created: number;
}

export default function CoralReefCursor() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [polyps, setPolyps] = useState<Polyp[]>([]);
    const idRef = useRef(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            idRef.current += 1;
            const p: Polyp = {
                id: idRef.current,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                created: Date.now(),
            };
            setPolyps((arr) => [...arr.slice(-25), p]);
        };
        el.addEventListener("mousemove", onMove);
        const cleanup = setInterval(() => {
            setPolyps((arr) => arr.filter((p) => Date.now() - p.created < 5500));
        }, 500);
        return () => {
            el.removeEventListener("mousemove", onMove);
            clearInterval(cleanup);
        };
    }, []);

    return (
        <div
            ref={ref}
            className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-sky-200 to-cyan-400 dark:from-sky-950 dark:to-cyan-950 overflow-hidden cursor-crosshair"
        >
            {polyps.map((p) => {
                const age = (Date.now() - p.created) / 1000; // seconds
                const grow = Math.min(1, age / 0.6);
                const fade = Math.max(0, 1 - age / 5);
                return (
                    <div
                        key={p.id}
                        className="absolute"
                        style={{ left: p.x, top: p.y }}
                    >
                        {/* branches */}
                        {Array.from({ length: 5 }).map((_, i) => {
                            const a = (i / 5) * Math.PI * 2;
                            const len = 18 * grow;
                            return (
                                <div
                                    key={i}
                                    className="absolute left-0 top-0 origin-bottom bg-rose-400 dark:bg-rose-300 rounded-full"
                                    style={{
                                        width: 2,
                                        height: len,
                                        transform: `rotate(${(a * 180) / Math.PI}deg)`,
                                        opacity: fade,
                                    }}
                                />
                            );
                        })}
                        {/* core */}
                        <div
                            className="absolute left-0 top-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-rose-600 dark:bg-rose-200"
                            style={{ opacity: fade }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
