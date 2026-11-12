"use client";

import React, { useEffect, useRef, useState } from "react";

// A small flock of V-shaped bird silhouettes following a leader with
// simple boids cohesion/separation. Black on white, white on black.
export default function VaporTrailBirds() {
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

        interface Bird {
            x: number;
            y: number;
            vx: number;
            vy: number;
            history: { x: number; y: number }[];
        }
        let birds: Bird[] = [];

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
            if (birds.length === 0) {
                for (let i = 0; i < 7; i++) {
                    birds.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        vx: 1.2 + Math.random() * 0.4,
                        vy: (Math.random() - 0.5) * 0.4,
                        history: [],
                    });
                }
            }
        };

        const drawV = (x: number, y: number, vx: number, vy: number) => {
            const ang = Math.atan2(vy, vx);
            const spread = 0.5;
            const len = 6;
            const tipX = x + Math.cos(ang) * len;
            const tipY = y + Math.sin(ang) * len;
            const leftX = x + Math.cos(ang + spread) * len * 0.6;
            const leftY = y + Math.sin(ang + spread) * len * 0.6;
            const rightX = x + Math.cos(ang - spread) * len * 0.6;
            const rightY = y + Math.sin(ang - spread) * len * 0.6;
            ctx.beginPath();
            ctx.moveTo(leftX, leftY);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(rightX, rightY);
            ctx.stroke();
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(0, 0, width, height);

            // leader target — drifts in a slow loop
            const targetX = width * 0.5 + Math.sin(t * 0.004) * width * 0.35;
            const targetY = height * 0.5 + Math.cos(t * 0.005) * height * 0.3;

            ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(20, 20, 30, 0.8)";
            ctx.lineWidth = 1.4;
            ctx.lineCap = "round";

            for (const b of birds) {
                // cohesion: toward leader
                const dx = targetX - b.x;
                const dy = targetY - b.y;
                const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
                b.vx += (dx / d) * 0.02;
                b.vy += (dy / d) * 0.02;
                // separation from neighbors
                for (const o of birds) {
                    if (o === b) continue;
                    const ddx = b.x - o.x;
                    const ddy = b.y - o.y;
                    const dd = ddx * ddx + ddy * ddy + 0.001;
                    if (dd < 900) {
                        b.vx += (ddx / dd) * 6;
                        b.vy += (ddy / dd) * 6;
                    }
                }
                // damping + speed cap
                b.vx *= 0.98;
                b.vy *= 0.98;
                const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                if (sp > 2.4) {
                    b.vx = (b.vx / sp) * 2.4;
                    b.vy = (b.vy / sp) * 2.4;
                }
                if (sp < 1.2) {
                    b.vx = (b.vx / (sp + 0.001)) * 1.2;
                    b.vy = (b.vy / (sp + 0.001)) * 1.2;
                }
                b.x += b.vx;
                b.y += b.vy;

                // trail
                b.history.push({ x: b.x, y: b.y });
                if (b.history.length > 14) b.history.shift();
                for (let i = 0; i < b.history.length - 1; i++) {
                    const a = i / b.history.length;
                    ctx.strokeStyle = isDark
                        ? `rgba(255, 255, 255, ${a * 0.18})`
                        : `rgba(20, 20, 30, ${a * 0.15})`;
                    ctx.beginPath();
                    ctx.moveTo(b.history[i].x, b.history[i].y);
                    ctx.lineTo(b.history[i + 1].x, b.history[i + 1].y);
                    ctx.stroke();
                }
                drawV(b.x, b.y, b.vx, b.vy);
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
