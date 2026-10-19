"use client";

import React, { useEffect, useRef, useState } from "react";

// N/S bar magnet pairs in a grid; each pair flips polarity (color swaps)
// on a sine wave with neighbor-coupled phase. Faint field lines drawn between.
export default function BarMagnetArray() {
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
        const cols = 6;
        const rows = 4;

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

            const cellW = width / (cols + 1);
            const cellH = height / (rows + 1);
            const barW = Math.min(cellW, cellH) * 0.6;
            const barH = barW * 0.3;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cx = (c + 1) * cellW;
                    const cy = (r + 1) * cellH;
                    const phase = c * 0.3 + r * 0.5 + t * 0.02;
                    const polarity = Math.sin(phase) > 0 ? 1 : -1;

                    // left half
                    ctx.fillStyle = polarity > 0
                        ? (isDark ? "#ef4444" : "#b91c1c")
                        : (isDark ? "#3b82f6" : "#1d4ed8");
                    ctx.fillRect(cx - barW / 2, cy - barH / 2, barW / 2, barH);
                    // right half
                    ctx.fillStyle = polarity > 0
                        ? (isDark ? "#3b82f6" : "#1d4ed8")
                        : (isDark ? "#ef4444" : "#b91c1c");
                    ctx.fillRect(cx, cy - barH / 2, barW / 2, barH);
                    // outline
                    ctx.strokeStyle = isDark ? "#fff" : "#000";
                    ctx.lineWidth = 0.8;
                    ctx.strokeRect(cx - barW / 2, cy - barH / 2, barW, barH);
                    // N / S labels
                    ctx.fillStyle = isDark ? "#fff" : "#fff";
                    ctx.font = `bold ${Math.max(8, barH * 0.5)}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("N", cx - barW / 4, cy);
                    ctx.fillText("S", cx + barW / 4, cy);
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
