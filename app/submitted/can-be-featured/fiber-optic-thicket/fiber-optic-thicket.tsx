"use client";

import React, { useEffect, useRef, useState } from "react";

// Dense thicket of curving light strands; each strand is a spline that
// warps over time with sine displacement.
export default function FiberOpticThicket() {
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

        interface Strand {
            baseY: number;
            amp: number;
            freq: number;
            phase: number;
            speed: number;
            hue: number;
        }
        let strands: Strand[] = [];

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

        const seed = () => {
            strands = [];
            const n = 40;
            for (let i = 0; i < n; i++) {
                strands.push({
                    baseY: (i / n) * height + (Math.random() - 0.5) * 20,
                    amp: 18 + Math.random() * 50,
                    freq: 0.005 + Math.random() * 0.01,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.0008 + Math.random() * 0.0015,
                    hue: isDark ? 280 + Math.random() * 80 : 220 + Math.random() * 60,
                });
            }
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 8, 0.25)" : "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(0, 0, width, height);

            ctx.lineWidth = 1.2;
            for (const s of strands) {
                ctx.beginPath();
                for (let x = 0; x <= width; x += 6) {
                    const y =
                        s.baseY +
                        Math.sin(x * s.freq + t * s.speed + s.phase) * s.amp +
                        Math.cos(x * s.freq * 0.5 + t * s.speed * 0.7) * s.amp * 0.4;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                if (isDark) {
                    ctx.strokeStyle = `hsla(${s.hue}, 90%, 65%, 0.5)`;
                    ctx.shadowColor = `hsla(${s.hue}, 90%, 60%, 0.9)`;
                    ctx.shadowBlur = 6;
                } else {
                    ctx.strokeStyle = `hsla(${s.hue}, 30%, 35%, 0.35)`;
                    ctx.shadowBlur = 0;
                }
                ctx.stroke();
            }
            ctx.shadowBlur = 0;

            raf = requestAnimationFrame(draw);
        };

        resize();
        seed();
        draw();
        window.addEventListener("resize", () => {
            resize();
            seed();
        });

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
