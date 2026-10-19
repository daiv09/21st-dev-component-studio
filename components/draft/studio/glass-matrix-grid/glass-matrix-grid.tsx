'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
}

export default function GlassMatrixGrid() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const mouse = { x: -1000, y: -1000 };

        let particles: Particle[] = [];

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
            initParticles();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const initParticles = () => {
            particles = [];
            const count = Math.min(Math.floor((width * height) / 4000), 180);

            for (let i = 0; i < count; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                particles.push({
                    x,
                    y,
                    z: Math.random() * 2 + 1,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    baseX: x,
                    baseY: y,
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        let time = 0;

        const render = () => {
            time += 0.01;

            const bgColor = isDarkMode ? '#090d16' : '#f1f5f9';
            const blueColor = isDarkMode ? '147, 197, 253' : '37, 99, 235';

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            // Particle Motion Loop
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.x += p.vx + Math.sin(time + p.z) * 0.3;
                p.y += p.vy + Math.cos(time + p.z) * 0.3;

                // Mouse Displace
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 200 && dist > 0) {
                    const force = (1 - dist / 200) * 20;
                    const angle = Math.atan2(dy, dx);
                    p.x -= Math.cos(angle) * force * 0.1;
                    p.y -= Math.sin(angle) * force * 0.1;
                }

                // Screen Wrap
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Render Particle Point
                ctx.fillStyle = `rgba(${blueColor}, ${0.2 * p.z})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.z * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw Fluid Connections
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.15;
                        ctx.strokeStyle = `rgba(${blueColor}, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDarkMode]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none">
            <canvas ref={canvasRef} className="absolute inset-0 block" />

            {/* Glassmorphic Multi-Card Grid */}
            <div className="relative z-10 flex h-full items-center justify-center px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    {[
                        { title: 'Fluid Motion', desc: 'Real-time particle kinematics reacting to cursor vectors.' },
                        { title: 'Glassmorphism', desc: 'Hardware-accelerated CSS backdrop blurring and light reflection.' },
                        { title: 'Responsive Design', desc: 'Dynamic DPR scaling for 120 FPS performance.' },
                    ].map((card, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-2xl bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-blue-400/30 transition-all duration-300 shadow-xl space-y-3"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-sm font-bold">
                                0{idx + 1}
                            </div>
                            <h3 className="text-xl font-bold text-white">{card.title}</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}