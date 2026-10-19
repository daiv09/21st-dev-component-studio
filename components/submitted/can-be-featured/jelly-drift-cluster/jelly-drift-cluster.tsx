"use client";

import React, { useEffect, useRef, useState } from "react";

// ~6 jellyfish-like soft glowing orbs that drift up and down with sine
// bobbing and have trailing tentacles. Bioluminescent on dark, pastel on light.
export default function JellyDriftCluster() {
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

        interface Jelly {
            x: number;
            baseY: number;
            r: number;
            hue: number;
            speed: number;
            amp: number;
            phase: number;
        }
        let jellies: Jelly[] = [];

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

            jellies = [];
            for (let i = 0; i < 6; i++) {
                jellies.push({
                    x: (i + 0.5) * (width / 6) + (Math.random() - 0.5) * 30,
                    baseY: height * (0.2 + Math.random() * 0.5),
                    r: 16 + Math.random() * 18,
                    hue: isDark ? 170 + Math.random() * 60 : 280 + Math.random() * 60,
                    speed: 0.005 + Math.random() * 0.005,
                    amp: 30 + Math.random() * 30,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(2, 8, 18, 0.15)" : "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(0, 0, width, height);

            for (const j of jellies) {
                const y = j.baseY + Math.sin(t * j.speed + j.phase) * j.amp;
                const x = j.x + Math.cos(t * j.speed * 0.7 + j.phase) * 8;

                // tentacles
                ctx.lineWidth = 1;
                for (let k = -2; k <= 2; k++) {
                    ctx.beginPath();
                    const startX = x + k * 4;
                    const startY = y + j.r * 0.5;
                    ctx.moveTo(startX, startY);
                    for (let s = 0; s <= 6; s++) {
                        const sy = startY + s * 6;
                        const sx =
                            startX +
                            Math.sin(s * 0.5 + t * 0.05 + k + j.phase) * 6 +
                            k * 0.5;
                        ctx.lineTo(sx, sy);
                    }
                    ctx.strokeStyle = isDark
                        ? `hsla(${j.hue}, 80%, 60%, 0.45)`
                        : `hsla(${j.hue}, 50%, 60%, 0.5)`;
                    ctx.stroke();
                }

                // bell
                ctx.beginPath();
                ctx.arc(x, y, j.r, Math.PI, 0);
                ctx.quadraticCurveTo(x + j.r, y + j.r * 0.6, x + j.r * 0.5, y + j.r * 0.9);
                ctx.quadraticCurveTo(x, y + j.r, x - j.r * 0.5, y + j.r * 0.9);
                ctx.quadraticCurveTo(x - j.r, y + j.r * 0.6, x - j.r, y);
                const g = ctx.createRadialGradient(x, y, 0, x, y, j.r);
                if (isDark) {
                    g.addColorStop(0, `hsla(${j.hue}, 90%, 75%, 0.9)`);
                    g.addColorStop(0.7, `hsla(${j.hue}, 90%, 55%, 0.5)`);
                    g.addColorStop(1, `hsla(${j.hue}, 90%, 40%, 0)`);
                } else {
                    g.addColorStop(0, `hsla(${j.hue}, 70%, 70%, 0.85)`);
                    g.addColorStop(1, `hsla(${j.hue}, 70%, 70%, 0)`);
                }
                ctx.fillStyle = g;
                ctx.fill();
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
