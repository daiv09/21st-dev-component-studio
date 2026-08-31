"use client";

import React, { useEffect, useRef, useState } from "react";

// 7 vertical fluted pillars; each pillar's vertical fluting scrolls at a
// different speed, like running water.
export default function FlutedPillarCluster() {
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
            ctx.fillStyle = isDark ? "rgba(2, 6, 18, 0.1)" : "rgba(245, 245, 250, 0.1)";
            ctx.fillRect(0, 0, width, height);

            const count = 7;
            const pW = width / (count * 1.4);
            const pH = height * 0.85;
            const startY = height * 0.075;
            for (let i = 0; i < count; i++) {
                const cx = width * 0.1 + i * (width * 0.8) / (count - 1);
                const top = startY;
                const bot = startY + pH;

                // body (gradient)
                const g = ctx.createLinearGradient(cx - pW / 2, 0, cx + pW / 2, 0);
                if (isDark) {
                    g.addColorStop(0, "#1e293b");
                    g.addColorStop(0.5, "#475569");
                    g.addColorStop(1, "#1e293b");
                } else {
                    g.addColorStop(0, "#cbd5e1");
                    g.addColorStop(0.5, "#f1f5f9");
                    g.addColorStop(1, "#cbd5e1");
                }
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.moveTo(cx - pW / 2, top);
                ctx.lineTo(cx + pW / 2, top);
                ctx.lineTo(cx + pW / 2, bot);
                ctx.lineTo(cx - pW / 2, bot);
                ctx.closePath();
                ctx.fill();

                // fluting (vertical scrolling lines)
                const flutes = 9;
                const speed = 0.4 + i * 0.15;
                const offset = (t * speed) % (pH / flutes);
                ctx.lineWidth = 1.2;
                for (let f = 0; f < flutes; f++) {
                    const fx = cx - pW / 2 + (f / (flutes - 1)) * pW;
                    const a = isDark ? 0.4 : 0.5;
                    ctx.strokeStyle = isDark
                        ? `rgba(255, 255, 255, ${a})`
                        : `rgba(15, 23, 42, ${a})`;
                    ctx.beginPath();
                    let first = true;
                    for (let y = top; y < bot; y += 2) {
                        const phase = (y - top + offset) * 0.05;
                        const xo = Math.sin(phase + f) * 1.2;
                        if (first) {
                            ctx.moveTo(fx + xo, y);
                            first = false;
                        } else {
                            ctx.lineTo(fx + xo, y);
                        }
                    }
                    ctx.stroke();
                }

                // cap & base
                ctx.fillStyle = isDark ? "#0f172a" : "#94a3b8";
                ctx.fillRect(cx - pW / 2 - 3, top - 6, pW + 6, 6);
                ctx.fillRect(cx - pW / 2 - 3, bot, pW + 6, 6);
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
