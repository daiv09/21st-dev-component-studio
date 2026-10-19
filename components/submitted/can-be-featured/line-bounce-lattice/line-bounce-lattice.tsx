"use client";

import React, { useEffect, useRef, useState } from "react";

// Triangular grid of lines where each line's length pulses with
// |sin| with phase offset per row/column. Geodesic pulsing pattern.
export default function LineBounceLattice() {
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
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(0, 0, width, height);

            const cell = 28;
            const cols = Math.ceil(width / cell) + 2;
            const rows = Math.ceil(height / cell) + 2;

            ctx.lineCap = "round";
            for (let r = -1; r < rows; r++) {
                for (let c = -1; c < cols; c++) {
                    const x = c * cell;
                    const y = r * cell;
                    // vertical line
                    const phaseV = c * 0.2 + r * 0.15 + t * 0.02;
                    const lenV = (Math.abs(Math.sin(phaseV)) * 0.8 + 0.2) * cell * 0.9;
                    const cy = y + cell / 2;
                    ctx.beginPath();
                    ctx.moveTo(x, cy - lenV / 2);
                    ctx.lineTo(x, cy + lenV / 2);
                    ctx.strokeStyle = isDark
                        ? `rgba(168, 85, 247, ${0.3 + Math.abs(Math.sin(phaseV)) * 0.5})`
                        : `rgba(124, 58, 237, ${0.3 + Math.abs(Math.sin(phaseV)) * 0.5})`;
                    ctx.lineWidth = 1.4;
                    ctx.stroke();

                    // horizontal line
                    const phaseH = c * 0.18 + r * 0.2 + t * 0.025;
                    const lenH = (Math.abs(Math.cos(phaseH)) * 0.8 + 0.2) * cell * 0.9;
                    const cx = x + cell / 2;
                    ctx.beginPath();
                    ctx.moveTo(cx - lenH / 2, y);
                    ctx.lineTo(cx + lenH / 2, y);
                    ctx.strokeStyle = isDark
                        ? `rgba(34, 211, 238, ${0.3 + Math.abs(Math.cos(phaseH)) * 0.5})`
                        : `rgba(14, 116, 144, ${0.3 + Math.abs(Math.cos(phaseH)) * 0.5})`;
                    ctx.lineWidth = 1.4;
                    ctx.stroke();
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
