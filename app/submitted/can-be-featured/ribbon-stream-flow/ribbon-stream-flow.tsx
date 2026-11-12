"use client";

import React, { useEffect, useRef, useState } from "react";

// 3 long horizontal ribbons that wave horizontally with sine displacement,
// like aurora curtains. Color gradient along length.
export default function RibbonStreamFlow() {
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

        interface Ribbon {
            baseY: number;
            thickness: number;
            amp: number;
            freq: number;
            phase: number;
            speed: number;
            c1: [number, number, number];
            c2: [number, number, number];
        }

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(2, 2, 8, 0.18)" : "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(0, 0, width, height);

            const ribbons: Ribbon[] = isDark
                ? [
                      { baseY: height * 0.3, thickness: 60, amp: 50, freq: 0.004, phase: 0, speed: 0.012, c1: [34, 211, 238], c2: [168, 85, 247] },
                      { baseY: height * 0.55, thickness: 70, amp: 70, freq: 0.003, phase: 1.5, speed: 0.009, c1: [99, 102, 241], c2: [236, 72, 153] },
                      { baseY: height * 0.78, thickness: 80, amp: 90, freq: 0.0025, phase: 3, speed: 0.007, c1: [236, 72, 153], c2: [251, 191, 36] },
                  ]
                : [
                      { baseY: height * 0.3, thickness: 60, amp: 40, freq: 0.004, phase: 0, speed: 0.012, c1: [165, 180, 252], c2: [196, 181, 253] },
                      { baseY: height * 0.55, thickness: 70, amp: 50, freq: 0.003, phase: 1.5, speed: 0.009, c1: [199, 210, 254], c2: [253, 186, 232] },
                      { baseY: height * 0.78, thickness: 80, amp: 60, freq: 0.0025, phase: 3, speed: 0.007, c1: [252, 211, 77], c2: [253, 164, 175] },
                  ];

            for (const r of ribbons) {
                // build top and bottom edges
                const top: number[] = [];
                const bot: number[] = [];
                for (let x = 0; x <= width; x += 8) {
                    const wave = Math.sin(x * r.freq + t * r.speed + r.phase) * r.amp;
                    const wave2 = Math.cos(x * r.freq * 0.7 + t * r.speed * 0.5 + r.phase) * r.amp * 0.4;
                    top.push(r.baseY + wave - r.thickness / 2 + wave2);
                    bot.push(r.baseY + wave + r.thickness / 2 + wave2);
                }
                const g = ctx.createLinearGradient(0, r.baseY - r.thickness, 0, r.baseY + r.thickness);
                g.addColorStop(
                    0,
                    isDark
                        ? `rgba(${r.c1[0]}, ${r.c1[1]}, ${r.c1[2]}, 0)`
                        : `rgba(${r.c1[0]}, ${r.c1[1]}, ${r.c1[2]}, 0.0)`
                );
                g.addColorStop(
                    0.5,
                    isDark
                        ? `rgba(${r.c2[0]}, ${r.c2[1]}, ${r.c2[2]}, 0.45)`
                        : `rgba(${r.c2[0]}, ${r.c2[1]}, ${r.c2[2]}, 0.45)`
                );
                g.addColorStop(
                    1,
                    isDark
                        ? `rgba(${r.c1[0]}, ${r.c1[1]}, ${r.c1[2]}, 0)`
                        : `rgba(${r.c1[0]}, ${r.c1[1]}, ${r.c1[2]}, 0)`
                );
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.moveTo(0, top[0]);
                for (let i = 1; i < top.length; i++) ctx.lineTo(i * 8, top[i]);
                for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(i * 8, bot[i]);
                ctx.closePath();
                ctx.fill();
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
