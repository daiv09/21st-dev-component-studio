"use client";

import React, { useEffect, useRef, useState } from "react";

// A flat plane of "stones" (small ovals) at the bottom; every ~1.5s a
// "murmur" passes through — each stone briefly pulses in a left-to-right
// wave with a stagger.
export default function MurmurRippleStones() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);
    const waveRef = useRef(0);
    const lastWave = useRef(0);

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

        const draw = (t: number) => {
            const g = ctx.createLinearGradient(0, 0, 0, height);
            g.addColorStop(0, isDark ? "#1e293b" : "#e2e8f0");
            g.addColorStop(1, isDark ? "#0f172a" : "#94a3b8");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, width, height);

            if (t - lastWave.current > 1500) {
                waveRef.current = 0;
                lastWave.current = t;
            }
            const wave = waveRef.current;
            waveRef.current += 1;

            const cols = 20;
            const rows = 4;
            const cellW = width / cols;
            const cellH = height / rows;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = r * cols + c;
                    const x = c * cellW + cellW / 2;
                    const y = height - cellH * (r + 0.5);
                    const local = wave - idx * 1.5;
                    let scale = 1;
                    if (local > 0 && local < 30) {
                        scale = 1 + Math.sin((local / 30) * Math.PI) * 0.6;
                    }
                    const rx = cellW * 0.35 * scale;
                    const ry = cellH * 0.3 * scale;
                    ctx.beginPath();
                    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
                    ctx.fillStyle = isDark
                        ? `rgba(148, 163, 184, ${0.6 + scale * 0.2})`
                        : `rgba(71, 85, 105, ${0.5 + scale * 0.3})`;
                    ctx.fill();
                }
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        raf = requestAnimationFrame(draw);
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
