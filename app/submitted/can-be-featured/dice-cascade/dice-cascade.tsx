"use client";

import React, { useEffect, useRef, useState } from "react";

// A stream of dice falling from the top, tumbling with angular velocity,
// settling at the bottom in a pile. Click to drop a new die.
interface Die {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    size: number;
    value: number;
    settled: boolean;
}

export default function DiceCascade() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);
    const diceRef = useRef<Die[]>([]);
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
        const g = 0.18;
        const floorH = 24;

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

        const spawn = (x: number) => {
            diceRef.current.push({
                x,
                y: -20,
                vx: (Math.random() - 0.5) * 1.2,
                vy: 0,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.1,
                size: 22,
                value: 1 + Math.floor(Math.random() * 6),
                settled: false,
            });
        };

        const drawPip = (cx: number, cy: number, r: number, gx: number, gy: number, p: number) => {
            const positions: Record<number, [number, number][]> = {
                1: [[0.5, 0.5]],
                2: [[0.25, 0.25], [0.75, 0.75]],
                3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
                4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
                5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
                6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
            };
            for (const [px, py] of positions[p]) {
                ctx.beginPath();
                ctx.arc(cx - r * 0.5 + px * r, cy - r * 0.5 + py * r, r * 0.08, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? "#0f172a" : "#1e293b";
                ctx.fill();
            }
        };

        const draw = (t: number) => {
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(0, 0, width, height);

            // floor
            ctx.fillStyle = isDark ? "#1e293b" : "#cbd5e1";
            ctx.fillRect(0, height - floorH, width, floorH);

            if (t - lastSpawn.current > 380) {
                spawn(40 + Math.random() * (width - 80));
                lastSpawn.current = t;
            }

            const arr = diceRef.current;
            for (let i = 0; i < arr.length; i++) {
                const d = arr[i];
                if (!d.settled) {
                    d.vy += g;
                    d.x += d.vx;
                    d.y += d.vy;
                    d.rot += d.vr;
                    if (d.y + d.size > height - floorH) {
                        d.y = height - floorH - d.size;
                        d.vy *= -0.35;
                        d.vr *= 0.7;
                        d.vx *= 0.7;
                        if (Math.abs(d.vy) < 0.5) {
                            d.settled = true;
                            d.vy = 0;
                            d.vx = 0;
                            d.vr = 0;
                        }
                    }
                    if (d.x < d.size) {
                        d.x = d.size;
                        d.vx *= -0.5;
                    }
                    if (d.x > width - d.size) {
                        d.x = width - d.size;
                        d.vx *= -0.5;
                    }
                }
                // draw
                ctx.save();
                ctx.translate(d.x, d.y + d.size / 2);
                ctx.rotate(d.rot);
                const s = d.size;
                ctx.fillStyle = isDark ? "#f8fafc" : "#fff";
                ctx.strokeStyle = isDark ? "#475569" : "#94a3b8";
                ctx.lineWidth = 1.4;
                ctx.fillRect(-s / 2, -s / 2, s, s);
                ctx.strokeRect(-s / 2, -s / 2, s, s);
                drawPip(0, 0, s, 0, 0, d.value);
                ctx.restore();
            }
            // limit pile
            if (arr.length > 40) arr.splice(0, 5);

            raf = requestAnimationFrame(draw);
        };

        const click = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            spawn(e.clientX - rect.left);
        };

        resize();
        raf = requestAnimationFrame(draw);
        canvas.addEventListener("click", click);
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("click", click);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden cursor-pointer">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
