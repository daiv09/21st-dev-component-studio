"use client";

import React, { useEffect, useRef, useState } from "react";

// Hundreds of small particles in concentric ring orbits, each ring drifts
// independently. Color wash (cyan -> violet -> pink) modulated by radius.
export default function AuroraOrbitField() {
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
        let cx = 0;
        let cy = 0;
        let t = 0;

        interface Particle {
            ring: number;
            angle: number;
            speed: number;
            size: number;
        }
        let particles: Particle[] = [];
        const ringCount = 14;
        const perRing = 18;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const parent = canvas.parentElement;
            width = parent ? parent.clientWidth : window.innerWidth;
            height = parent ? parent.clientHeight : window.innerHeight;
            cx = width / 2;
            cy = height / 2;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const build = () => {
            particles = [];
            const maxR = Math.min(width, height) * 0.45;
            for (let r = 0; r < ringCount; r++) {
                const radius = (r + 1) * (maxR / ringCount);
                const dir = r % 2 === 0 ? 1 : -1;
                for (let p = 0; p < perRing; p++) {
                    particles.push({
                        ring: r,
                        angle: (p / perRing) * Math.PI * 2,
                        speed: (0.0006 + r * 0.00008) * dir,
                        size: 1.2 + (ringCount - r) * 0.08,
                    });
                }
            }
        };

        const colorForRing = (r: number) => {
            const tt = r / ringCount;
            if (!isDark) {
                // muted indigo on white
                return `rgba(99, 102, 241, ${0.25 + tt * 0.55})`;
            }
            // neon cyan -> violet -> pink as radius grows
            const stops = [
                [34, 211, 238],
                [99, 102, 241],
                [168, 85, 247],
                [236, 72, 153],
            ];
            const seg = tt * (stops.length - 1);
            const i = Math.min(stops.length - 2, Math.floor(seg));
            const f = seg - i;
            const a = stops[i];
            const b = stops[i + 1];
            const rr = Math.round(a[0] + (b[0] - a[0]) * f);
            const gg = Math.round(a[1] + (b[1] - a[1]) * f);
            const bb = Math.round(a[2] + (b[2] - a[2]) * f);
            return `rgba(${rr}, ${gg}, ${bb}, 0.9)`;
        };

        const draw = () => {
            t += 1;
            const bg = isDark ? "rgba(2, 2, 8, 0.35)" : "rgba(255, 255, 255, 0.35)";
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            const maxR = Math.min(width, height) * 0.45;
            const drift = Math.sin(t * 0.002) * 8;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.angle += p.speed;
                const r = (p.ring + 1) * (maxR / ringCount) + drift;
                const x = cx + Math.cos(p.angle) * r;
                const y = cy + Math.sin(p.angle) * r;
                ctx.fillStyle = colorForRing(p.ring);
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            // soft center glow
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.6);
            if (isDark) {
                g.addColorStop(0, "rgba(168, 85, 247, 0.08)");
                g.addColorStop(1, "rgba(0, 0, 0, 0)");
            } else {
                g.addColorStop(0, "rgba(99, 102, 241, 0.05)");
                g.addColorStop(1, "rgba(255, 255, 255, 0)");
            }
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, width, height);

            raf = requestAnimationFrame(draw);
        };

        resize();
        build();
        draw();
        window.addEventListener("resize", () => {
            resize();
            build();
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
