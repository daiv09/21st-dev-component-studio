"use client";

import React, { useEffect, useRef, useState } from "react";

// Japanese ink-marbling: dozens of slowly drifting circles with additive
// blending. On click, drop a new ink spot.
export default function SuminagashiMarbler() {
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

        interface Drop {
            x: number;
            y: number;
            vx: number;
            vy: number;
            r: number;
            hue: number;
            life: number;
        }
        let drops: Drop[] = [];

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
            drops = [];
            for (let i = 0; i < 18; i++) spawn(Math.random() * width, Math.random() * height);
        };

        const spawn = (x: number, y: number) => {
            drops.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                r: 30 + Math.random() * 80,
                hue: Math.floor(Math.random() * 360),
                life: 1,
            });
        };

        const click = (e: React.MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            spawn(e.clientX - rect.left, e.clientY - rect.top);
        };

        const draw = () => {
            ctx.fillStyle = isDark ? "rgba(248, 246, 240, 0.04)" : "rgba(255, 255, 255, 0.06)";
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = isDark ? "screen" : "multiply";

            for (const d of drops) {
                d.x += d.vx;
                d.y += d.vy;
                d.vx += (Math.random() - 0.5) * 0.05;
                d.vy += (Math.random() - 0.5) * 0.05;
                d.vx *= 0.99;
                d.vy *= 0.99;

                if (d.x < -d.r) d.x = width + d.r;
                if (d.x > width + d.r) d.x = -d.r;
                if (d.y < -d.r) d.y = height + d.r;
                if (d.y > height + d.r) d.y = -d.r;

                const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
                g.addColorStop(0, `hsla(${d.hue}, 70%, ${isDark ? 55 : 45}%, ${0.55 * d.life})`);
                g.addColorStop(0.6, `hsla(${d.hue}, 70%, 50%, ${0.2 * d.life})`);
                g.addColorStop(1, `hsla(${d.hue}, 70%, 50%, 0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = "source-over";

            raf = requestAnimationFrame(draw);
        };

        resize();
        seed();
        draw();
        canvas.addEventListener("click", click as any);
        window.addEventListener("resize", () => {
            resize();
            seed();
        });

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("click", click as any);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div
            onClick={(e) => {
                // forward to canvas listener; kept here for visual affordance
                (e.currentTarget.querySelector("canvas") as HTMLCanvasElement)?.dispatchEvent(
                    new MouseEvent("click", { clientX: e.clientX, clientY: e.clientY })
                );
            }}
            className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#f8f6f0] dark:bg-[#0a0a10] overflow-hidden cursor-crosshair"
        >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
