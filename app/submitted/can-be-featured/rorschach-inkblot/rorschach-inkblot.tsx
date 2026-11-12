"use client";

import React, { useEffect, useRef, useState } from "react";

// Symmetric inkblot (top-bottom mirror) that grows from the center.
// Uses stacked splotches with noise-driven displacement.
export default function RorschachInkblot() {
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

        const drawSplotch = (x: number, y: number, r: number, alpha: number, mirror: boolean) => {
            ctx.beginPath();
            const points = 28;
            for (let i = 0; i <= points; i++) {
                const a = (i / points) * Math.PI * 2;
                const n = Math.sin(a * 3 + t * 0.02) * 0.25 + Math.cos(a * 5 - t * 0.01) * 0.15;
                const rr = r * (1 + n);
                const px = x + Math.cos(a) * rr;
                const py = y + Math.sin(a) * rr;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            if (mirror) {
                ctx.beginPath();
                for (let i = 0; i <= points; i++) {
                    const a = (i / points) * Math.PI * 2;
                    const n = Math.sin(a * 3 + t * 0.02) * 0.25 + Math.cos(a * 5 - t * 0.01) * 0.15;
                    const rr = r * (1 + n);
                    const px = x + Math.cos(a) * rr;
                    const py = y - Math.sin(a) * rr;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            }
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            const grow = (Math.sin(t * 0.005) + 1.2) * 0.5; // 0.2..1.2

            ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(20, 20, 30, 0.85)";
            for (let i = 0; i < 7; i++) {
                const a = (i / 7) * Math.PI * 2;
                const r = 18 + i * 6;
                const dist = 30 + i * 14;
                const px = cx + Math.cos(a + t * 0.003) * dist * grow;
                const py = cy + Math.sin(a + t * 0.003) * dist * 0.5 * grow;
                drawSplotch(px, py, r * grow, 0.7, true);
            }
            // center blob
            drawSplotch(cx, cy, 24 * grow, 0.9, true);

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
