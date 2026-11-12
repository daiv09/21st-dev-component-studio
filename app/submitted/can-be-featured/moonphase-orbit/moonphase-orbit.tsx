"use client";

import React, { useEffect, useRef, useState } from "react";

// A single moon orbits a small center star in a slow elliptical path. As
// the moon moves, its phase is computed and the visible illuminated
// fraction is drawn. Stars twinkle in the background.
export default function MoonphaseOrbit() {
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

        interface Star { x: number; y: number; r: number; phase: number; }
        let stars: Star[] = [];

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

            stars = [];
            for (let i = 0; i < 60; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: 0.4 + Math.random() * 1.4,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        };

        const drawMoon = (cx: number, cy: number, r: number, phase: number) => {
            // phase: 0 = new, 0.5 = full, 1 = new
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? "#1e293b" : "#cbd5e1";
            ctx.fill();
            // illuminated portion
            const sweep = phase < 0.5 ? 1 : -1; // waxing/waning
            const lit = Math.abs(Math.cos(phase * Math.PI * 2));
            ctx.beginPath();
            ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, sweep < 0);
            ctx.ellipse(
                cx,
                cy,
                r * lit,
                r,
                0,
                -Math.PI / 2,
                Math.PI / 2,
                true
            );
            ctx.closePath();
            ctx.fillStyle = isDark ? "#f8fafc" : "#fef9c3";
            ctx.fill();
            ctx.restore();
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(2, 2, 16, 0.25)" : "rgba(224, 242, 254, 0.25)";
            ctx.fillRect(0, 0, width, height);

            // stars
            for (const s of stars) {
                const a = (Math.sin(t * 0.04 + s.phase) + 1) * 0.5;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = isDark
                    ? `rgba(255, 255, 255, ${0.3 + a * 0.7})`
                    : `rgba(30, 41, 59, ${0.3 + a * 0.5})`;
                ctx.fill();
            }

            const cx = width / 2;
            const cy = height / 2;
            const a = width * 0.32;
            const b = height * 0.22;
            const ang = t * 0.005;
            const mx = cx + Math.cos(ang) * a;
            const my = cy + Math.sin(ang) * b;
            const r = 22;

            // sun (center) — the "sun" direction is to the right
            const sunX = cx + a + 60;
            const sunY = cy;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? "#fbbf24" : "#f59e0b";
            ctx.shadowColor = isDark ? "#fbbf24" : "#f59e0b";
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;

            // phase = 0.5 - dot product normalized of moon position vs sun dir
            // simple approx: phase = (1 - cos(ang)) / 2 maps orbit angle to moon phase
            const phase = ((1 - Math.cos(ang)) / 2) % 1;
            drawMoon(mx, my, r, phase);

            // orbit line
            ctx.beginPath();
            ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2);
            ctx.strokeStyle = isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(15, 23, 42, 0.15)";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);

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
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
