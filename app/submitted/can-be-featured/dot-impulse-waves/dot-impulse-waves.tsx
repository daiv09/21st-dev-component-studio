"use client";

import React, { useEffect, useRef, useState } from "react";

// Grid of dots; every ~1.2s a random dot pulses outward as a wave
// propagating to neighbors with a delay.
export default function DotImpulseWaves() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);
        const h = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq.addEventListener("change", h);
        return () => mq.removeEventListener("change", h);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let raf = 0;
        let width = 0;
        let height = 0;
        let t = 0;
        let lastImpulse = 0;
        const cols = 24;
        const rows = 14;
        const pulses: { c: number; r: number; start: number }[] = [];

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const parent = canvas.parentElement;
            width = parent ? parent.clientWidth : window.innerWidth;
            height = parent ? parent.clientHeight : window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(0, 0, width, height);

            const cellW = width / cols;
            const cellH = height / rows;

            if (t - lastImpulse > 72) {
                pulses.push({
                    c: Math.floor(Math.random() * cols),
                    r: Math.floor(Math.random() * rows),
                    start: t,
                });
                lastImpulse = t;
                if (pulses.length > 4) pulses.shift();
            }

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = c * cellW + cellW / 2;
                    const y = r * cellH + cellH / 2;
                    let intensity = 0;
                    for (const p of pulses) {
                        const d = Math.hypot(c - p.c, r - p.r);
                        const elapsed = (t - p.start) * 0.6;
                        const wavefront = elapsed;
                        const dist = Math.abs(d - wavefront);
                        if (dist < 2) {
                            intensity = Math.max(intensity, 1 - dist / 2);
                        }
                    }
                    const baseR = Math.min(cellW, cellH) * 0.08;
                    const radius = baseR + intensity * Math.min(cellW, cellH) * 0.18;
                    const alpha = 0.25 + intensity * 0.7;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = isDark
                        ? `rgba(99, 102, 241, ${alpha})`
                        : `rgba(79, 70, 229, ${alpha * 0.85})`;
                    ctx.fill();
                }
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        draw();
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
