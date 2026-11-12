"use client";

import React, { useEffect, useRef, useState } from "react";

// A single tumbleweed rolling across the bottom from left to right,
// bouncing slightly with each rotation. Respawns on the left.
export default function TumbleweedBounce() {
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
        let x = 0;
        let y = 0;
        let rot = 0;
        const r = 22;

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
            y = height - r - 20;
            x = -r * 2;
        };

        const drawTumble = (cx: number, cy: number, rad: number, angle: number) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = isDark ? "#a16207" : "#92400e";
            // several crossing lines to suggest tangles
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2 + angle * 0.5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * rad * 0.2, Math.sin(a) * rad * 0.2);
                ctx.quadraticCurveTo(
                    Math.cos(a + 1) * rad,
                    Math.sin(a + 1) * rad,
                    Math.cos(a + 2) * rad * 0.3,
                    Math.sin(a + 2) * rad * 0.3
                );
                ctx.stroke();
            }
            // outer ring
            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        };

        const draw = () => {
            ctx.fillStyle = isDark
                ? "rgba(60, 30, 0, 0.18)"
                : "rgba(245, 220, 160, 0.18)";
            ctx.fillRect(0, 0, width, height);
            // ground
            ctx.fillStyle = isDark ? "#3f1d0e" : "#fde68a";
            ctx.fillRect(0, height - 16, width, 16);

            x += 2.2;
            // bounce every ~rotation
            const bounce = Math.abs(Math.sin(rot * 0.5)) * 4;
            y = height - r - 20 - bounce;
            rot += 0.16;

            drawTumble(x, y, r, rot);

            if (x - r > width + 10) {
                x = -r * 2;
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
