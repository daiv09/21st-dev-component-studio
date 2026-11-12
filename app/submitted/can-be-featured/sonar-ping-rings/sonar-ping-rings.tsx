"use client";

import React, { useEffect, useRef, useState } from "react";

// Sonar display: a center dot pings outward as expanding rings (3-4
// simultaneous at different stages). On mousemove inside, place a "target"
// that distorts the rings.
interface Ring { life: number; }
interface Target { x: number; y: number; life: number; }

export default function SonarPingRings() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);
    const rings = useRef<Ring[]>([{ life: 0 }, { life: -0.5 }, { life: -1 }]);
    const target = useRef<Target | null>(null);

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
            cx = width / 2;
            cy = height / 2;
        };

        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            target.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                life: 1,
            };
        };
        const onLeave = () => {
            target.current = null;
        };

        const draw = () => {
            ctx.fillStyle = isDark
                ? "rgba(0, 0, 0, 0.2)"
                : "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(0, 0, width, height);

            const maxR = Math.hypot(width, height) / 2;
            for (const r of rings.current) {
                r.life += 0.005;
                if (r.life > 1) r.life = 0;
                if (r.life < 0) continue;
                const radius = r.life * maxR;
                const alpha = 1 - r.life;
                ctx.beginPath();
                if (target.current) {
                    const t = target.current;
                    // approximate distortion: draw arc that bulges toward target
                    for (let a = 0; a <= Math.PI * 2; a += 0.05) {
                        const x = cx + Math.cos(a) * radius;
                        const y = cy + Math.sin(a) * radius;
                        const d = Math.hypot(x - t.x, y - t.y);
                        const bulge = Math.max(0, 1 - d / 200) * 10;
                        const px = x + (t.x - x) / (d + 0.01) * bulge;
                        const py = y + (t.y - y) / (d + 0.01) * bulge;
                        if (a === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                } else {
                    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                }
                ctx.strokeStyle = isDark
                    ? `rgba(34, 211, 238, ${alpha * 0.7})`
                    : `rgba(14, 116, 144, ${alpha * 0.5})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // crosshair
            ctx.strokeStyle = isDark
                ? "rgba(34, 211, 238, 0.6)"
                : "rgba(14, 116, 144, 0.6)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy);
            ctx.lineTo(cx + 12, cy);
            ctx.moveTo(cx, cy - 12);
            ctx.lineTo(cx, cy + 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? "#22d3ee" : "#0e7490";
            ctx.fill();

            if (target.current) {
                const t = target.current;
                t.life -= 0.01;
                ctx.beginPath();
                ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
                ctx.strokeStyle = isDark
                    ? `rgba(244, 114, 182, ${t.life})`
                    : `rgba(190, 24, 93, ${t.life})`;
                ctx.lineWidth = 1.4;
                ctx.stroke();
                if (t.life <= 0) target.current = null;
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        draw();
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
