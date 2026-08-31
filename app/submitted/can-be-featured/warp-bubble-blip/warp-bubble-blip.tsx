"use client";

import React, { useEffect, useRef, useState } from "react";

// At random intervals a "bubble" appears in the center, expands with a
// warpy distortion, pops (with a brief ring shockwave), then fades.
interface Bubble {
    x: number;
    y: number;
    life: number;
    maxR: number;
    popped: boolean;
}

export default function WarpBubbleBlip() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);
    const bubbles = useRef<Bubble[]>([]);
    const lastSpawn = useRef(0);

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
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(0, 0, width, height);

            if (t - lastSpawn.current > 1400 && bubbles.current.length < 3) {
                bubbles.current.push({
                    x: width / 2 + (Math.random() - 0.5) * 100,
                    y: height / 2 + (Math.random() - 0.5) * 60,
                    life: 0,
                    maxR: 30 + Math.random() * 30,
                    popped: false,
                });
                lastSpawn.current = t;
            }

            for (let i = bubbles.current.length - 1; i >= 0; i--) {
                const b = bubbles.current[i];
                b.life += 0.012;
                if (b.popped) {
                    // shockwave
                    const r = b.life * 90;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
                    ctx.strokeStyle = isDark
                        ? `rgba(244, 114, 182, ${(1 - b.life) * 0.7})`
                        : `rgba(190, 24, 93, ${(1 - b.life) * 0.6})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    if (b.life > 1) bubbles.current.splice(i, 1);
                    continue;
                }
                if (b.life >= 0.7 && !b.popped) {
                    b.popped = true;
                    b.life = 0;
                    continue;
                }
                const r = b.life * b.maxR;
                // distorted outline
                ctx.beginPath();
                for (let a = 0; a <= Math.PI * 2; a += 0.1) {
                    const warp = Math.sin(a * 5 + b.life * 10) * 3;
                    const rr = r + warp;
                    const x = b.x + Math.cos(a) * rr;
                    const y = b.y + Math.sin(a) * rr;
                    if (a === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
                g.addColorStop(
                    0,
                    isDark ? "rgba(244, 114, 182, 0.7)" : "rgba(244, 114, 182, 0.5)"
                );
                g.addColorStop(1, "rgba(244, 114, 182, 0)");
                ctx.fillStyle = g;
                ctx.fill();
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
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
