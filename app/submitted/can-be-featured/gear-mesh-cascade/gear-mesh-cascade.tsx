"use client";

import React, { useEffect, useRef, useState } from "react";

// 6 interlocking gears that rotate in a cascade; gear teeth mesh correctly
// so rotation direction flips between neighbors. A pointer line on each
// gear spins with it.
export default function GearMeshCascade() {
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

        interface Gear {
            x: number;
            y: number;
            r: number;
            teeth: number;
            angle: number;
            speed: number;
            color: string;
        }
        let gears: Gear[] = [];

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

            // build 6 gears in a chain
            const R = Math.min(width, height) * 0.12;
            const cy = height / 2;
            const cx0 = width * 0.15;
            const step = R * 1.7;
            gears = [];
            for (let i = 0; i < 6; i++) {
                const dir = i % 2 === 0 ? 1 : -1;
                gears.push({
                    x: cx0 + i * step,
                    y: cy + (i % 2 === 0 ? 0 : R * 0.6),
                    r: R * (i === 5 ? 0.6 : 1),
                    teeth: i === 5 ? 10 : 14,
                    angle: 0,
                    speed: 0.01 * dir,
                    color: isDark
                        ? `hsl(${(i * 50) % 360}, 70%, 60%)`
                        : `hsl(${(i * 50) % 360}, 50%, 40%)`,
                });
            }
        };

        const drawGear = (g: Gear) => {
            ctx.save();
            ctx.translate(g.x, g.y);
            ctx.rotate(g.angle);
            // teeth
            ctx.beginPath();
            for (let i = 0; i < g.teeth * 2; i++) {
                const a = (i / (g.teeth * 2)) * Math.PI * 2;
                const r = i % 2 === 0 ? g.r : g.r * 0.85;
                const x = Math.cos(a) * r;
                const y = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = g.color;
            ctx.fill();
            ctx.strokeStyle = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // hub
            ctx.beginPath();
            ctx.arc(0, 0, g.r * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? "#0f172a" : "#fff";
            ctx.fill();

            // pointer
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(g.r * 0.7, 0);
            ctx.strokeStyle = isDark ? "#fff" : "#000";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        };

        const draw = () => {
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(0, 0, width, height);

            for (const g of gears) {
                g.angle += g.speed;
                drawGear(g);
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
