"use client";

import React, { useEffect, useRef, useState } from "react";

// 5x5 grid of 4-petal clover shapes, each petal rotates independently
// with a slow sine offset.
export default function CloverFoldLattice() {
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

        const drawPetal = (cx: number, cy: number, r: number, rot: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);
            ctx.beginPath();
            ctx.ellipse(0, -r / 2, r * 0.35, r / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(0, 0, width, height);

            const cols = 5;
            const rows = 5;
            const cell = Math.min(width, height) / 6;
            const r = cell * 0.45;
            const startX = (width - cell * (cols - 1)) / 2;
            const startY = (height - cell * (rows - 1)) / 2;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cx = startX + col * cell;
                    const cy = startY + row * cell;
                    const phase = (col + row) * 0.4;
                    const spin = t * 0.015 + phase;
                    for (let p = 0; p < 4; p++) {
                        const baseA = (p / 4) * Math.PI * 2;
                        const wobble = Math.sin(spin + p + phase) * 0.3;
                        ctx.fillStyle = isDark
                            ? `hsla(${(phase * 60 + p * 30) % 360}, 80%, 60%, 0.7)`
                            : `hsla(${(phase * 60 + p * 30) % 360}, 60%, 50%, 0.7)`;
                        ctx.strokeStyle = isDark
                            ? `hsla(${(phase * 60 + p * 30) % 360}, 80%, 70%, 0.9)`
                            : `hsla(${(phase * 60 + p * 30) % 360}, 60%, 30%, 0.9)`;
                        drawPetal(cx, cy, r, baseA + wobble);
                    }
                    // center
                    ctx.beginPath();
                    ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
                    ctx.fillStyle = isDark ? "#fff" : "#000";
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
