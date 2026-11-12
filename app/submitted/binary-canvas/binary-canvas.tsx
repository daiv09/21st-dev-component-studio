'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BinaryDigit {
    x: number;
    y: number;
    z: number;
    char: '0' | '1';
    speed: number;
    baseSize: number;
    rotation: number;
    spin: number;
    opacity: number;
    trailLength: number;
}

export default function BinaryCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    // Listen for dark/light mode state & system preferences
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

        // Mouse vectors for organic parallax inertia
        const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e: MouseEvent) => {
            mouse.targetX = (e.clientX - width / 2) * 1.8;
            mouse.targetY = (e.clientY - height / 2) * 1.8;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Particle Config
        const COUNT = Math.min(Math.floor((width * height) / 1200), 1200); // Responsive scaling
        const FOCAL_LENGTH = 320;
        const MAX_DEPTH = 2200;
        const digits: BinaryDigit[] = [];

        const createDigit = (initialZ?: number): BinaryDigit => ({
            x: (Math.random() - 0.5) * width * 5,
            y: (Math.random() - 0.5) * height * 5,
            z: initialZ ?? Math.random() * MAX_DEPTH + 10,
            char: Math.random() > 0.48 ? '0' : '1',
            speed: Math.random() * 35 + 25, // Hyper-speed movement
            baseSize: Math.random() * 12 + 16,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.7 + 0.3,
            trailLength: Math.random() * 3 + 1,
        });

        for (let i = 0; i < COUNT; i++) {
            digits.push(createDigit());
        }

        let lastTime = performance.now();

        const render = (now: number) => {
            // Delta time calculation ensures constant speed across 60Hz, 120Hz, 144Hz, 240Hz screens
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            // Inertial mouse movement smoothing
            mouse.x += (mouse.targetX - mouse.x) * (1 - Math.exp(-12 * dt));
            mouse.y += (mouse.targetY - mouse.y) * (1 - Math.exp(-12 * dt));

            // Theme-dependent colors
            const bg = isDarkMode ? '#030303' : '#fafafa';
            const colorZero = isDarkMode ? '255, 255, 255' : '10, 10, 10'; // '0' stands out vividly
            const colorOne = isDarkMode ? '35, 35, 35' : '220, 220, 220';  // '1' acts as background structure

            // Clear Canvas with subtle persistent trails
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2 + mouse.x;
            const cy = height / 2 + mouse.y;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = 0; i < digits.length; i++) {
                const d = digits[i];

                // Move forward along Z axis
                d.z -= d.speed * dt * 60;
                d.rotation += d.spin * dt * 60;

                // Rapid stochastic character flipping
                if (Math.random() < 0.04) {
                    d.char = d.char === '0' ? '1' : '0';
                }

                // Respawn offscreen/passed digits
                if (d.z <= 1) {
                    digits[i] = createDigit(MAX_DEPTH);
                    continue;
                }

                const scale = FOCAL_LENGTH / d.z;
                const screenX = d.x * scale + cx;
                const screenY = d.y * scale + cy;

                // Quick bounds check for responsive culling
                if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) {
                    continue;
                }

                const size = d.baseSize * scale;
                const alpha = Math.min(1, Math.pow((MAX_DEPTH - d.z) / 500, 1.2)) * d.opacity;

                ctx.font = `900 ${size}pxui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(d.rotation);

                // Motion trail effect for hyper-speed sensation
                if (d.z < 800) {
                    const trailAlpha = alpha * 0.15;
                    ctx.fillStyle = d.char === '0'
                        ? `rgba(${colorZero}, ${trailAlpha})`
                        : `rgba(${colorOne}, ${trailAlpha})`;

                    for (let t = 1; t <= d.trailLength; t++) {
                        ctx.fillText(d.char, 0, -t * (size * 0.15));
                    }
                }

                // Primary Character
                if (d.char === '0') {
                    ctx.fillStyle = `rgba(${colorZero}, ${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(${colorOne}, ${alpha * 0.7})`;
                }

                ctx.fillText(d.char, 0, 0);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDarkMode]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-neutral-950 dark:bg-neutral-950 light:bg-neutral-50 select-none">
            <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />

            {/* Modern, non-AI aesthetic overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 md:p-12 mix-blend-difference text-white">
                <div className="flex justify-between items-start font-mono text-xs tracking-widest uppercase opacity-80">
                </div>

                <div className="max-w-2xl">
                    <h1 className="font-mono text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none">
                        010101
                    </h1>
                    <p className="mt-4 font-mono text-xs md:text-sm tracking-wider uppercase opacity-70">
                        Interactive Field. Drag mouse to alter viewport perspective.
                    </p>
                </div>
            </div>
        </div>
    );
}