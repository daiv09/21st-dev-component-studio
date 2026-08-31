"use client";

import React, { useEffect, useRef, useState } from "react";

// Slow metaball-like blobs that drift across the canvas and blend with
// soft additive opacity. Uses overlapping radial gradients.
export default function DriftCloudVeil() {
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

        interface Blob {
            x: number;
            y: number;
            vx: number;
            vy: number;
            r: number;
            hue: number;
            phase: number;
        }
        const blobs: Blob[] = [];
        const count = 14;

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
            blobs.length = 0;
            for (let i = 0; i < count; i++) {
                blobs.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.min(width, height) * (0.18 + Math.random() * 0.18),
                    hue: 200 + Math.random() * 100,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        };

        const draw = () => {
            // Background: light tint to leave trails
            ctx.fillStyle = isDark ? "rgba(2, 4, 12, 0.18)" : "rgba(255, 255, 255, 0.22)";
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = "lighter";

            for (const b of blobs) {
                b.x += b.vx + Math.sin((b.phase += 0.004)) * 0.2;
                b.y += b.vy + Math.cos(b.phase) * 0.15;
                if (b.x < -b.r) b.x = width + b.r;
                if (b.x > width + b.r) b.x = -b.r;
                if (b.y < -b.r) b.y = height + b.r;
                if (b.y > height + b.r) b.y = -b.r;

                const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                if (isDark) {
                    g.addColorStop(0, `hsla(${b.hue}, 90%, 65%, 0.55)`);
                    g.addColorStop(1, `hsla(${b.hue}, 90%, 50%, 0)`);
                } else {
                    g.addColorStop(0, `hsla(${b.hue}, 70%, 60%, 0.30)`);
                    g.addColorStop(1, `hsla(${b.hue}, 70%, 50%, 0)`);
                }
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = "source-over";
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
