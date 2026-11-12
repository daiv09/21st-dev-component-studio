"use client";

import React, { useEffect, useRef, useState } from "react";

// Concentric ripples emanate from random points on a "pool" surface,
// each growing and fading. Up to 8 simultaneous ripples.
interface Ripple {
    x: number;
    y: number;
    life: number;
    maxR: number;
}

export default function TidalPoolSwell() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);
    const ripples = useRef<Ripple[]>([]);
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
            // pool bg
            const g = ctx.createLinearGradient(0, 0, 0, height);
            g.addColorStop(0, isDark ? "#0c4a6e" : "#bae6fd");
            g.addColorStop(1, isDark ? "#082f49" : "#7dd3fc");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, width, height);

            if (t - lastSpawn.current > 700 && ripples.current.length < 8) {
                ripples.current.push({
                    x: 30 + Math.random() * (width - 60),
                    y: 30 + Math.random() * (height - 60),
                    life: 0,
                    maxR: 60 + Math.random() * 50,
                });
                lastSpawn.current = t;
            }

            for (let i = ripples.current.length - 1; i >= 0; i--) {
                const r = ripples.current[i];
                r.life += 0.012;
                if (r.life > 1) {
                    ripples.current.splice(i, 1);
                    continue;
                }
                const radius = r.life * r.maxR;
                const alpha = 1 - r.life;
                ctx.beginPath();
                ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = isDark
                    ? `rgba(186, 230, 253, ${alpha * 0.7})`
                    : `rgba(2, 132, 199, ${alpha * 0.6})`;
                ctx.lineWidth = 1.6;
                ctx.stroke();
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
