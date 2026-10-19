"use client";

import React, { useEffect, useRef } from 'react';

export default function PacmanLoader() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Pac-Man variables
        let pacmanX = width / 2 - 120;
        const pacmanY = height / 2;
        const radius = 28;
        let mouthAngle = 0.2;
        let mouthSpeed = 0.03;

        // Dots variables
        const dotSpacing = 35;
        const numDots = 8;
        const dots: { x: number; y: number; eaten: boolean; alpha: number }[] = [];

        for (let i = 0; i < numDots; i++) {
            dots.push({
                x: pacmanX + 50 + i * dotSpacing,
                y: pacmanY,
                eaten: false,
                alpha: 1,
            });
        }

        const animate = () => {
            ctx.fillStyle = '#0a0a0c';
            ctx.fillRect(0, 0, width, height);

            // Move Pacman back and forth loop
            pacmanX += 1.5;
            if (pacmanX > width / 2 + 120) {
                pacmanX = width / 2 - 120;
                dots.forEach(d => {
                    d.eaten = false;
                    d.alpha = 1;
                });
            }

            // Animate mouth opening/closing
            mouthAngle += mouthSpeed;
            if (mouthAngle > 0.45 || mouthAngle < 0.05) {
                mouthSpeed = -mouthSpeed;
            }

            // Draw and check dots
            dots.forEach((dot) => {
                if (!dot.eaten && Math.abs(pacmanX - dot.x) < 12) {
                    dot.eaten = true;
                }

                if (dot.eaten && dot.alpha > 0) {
                    dot.alpha -= 0.08;
                }

                if (dot.alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = Math.max(dot.alpha, 0);
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.restore();
                }
            });

            // Draw Pac-Man
            ctx.save();
            ctx.beginPath();
            ctx.arc(pacmanX, pacmanY, radius, mouthAngle * Math.PI, (2 - mouthAngle) * Math.PI);
            ctx.lineTo(pacmanX, pacmanY);
            ctx.fillStyle = '#facc15'; // Vibrant Pac-Man yellow
            ctx.fill();
            ctx.closePath();

            // Pac-Man Eye
            ctx.beginPath();
            ctx.arc(pacmanX + 2, pacmanY - radius / 2, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0a0c';
            ctx.fill();
            ctx.restore();

            // Minimal Loading Text below
            ctx.save();
            ctx.font = "500 13px 'Inter', -apple-system, sans-serif";
            ctx.fillStyle = "#666";
            ctx.textAlign = "center";
            ctx.letterSpacing = "2px";
            ctx.fillText("LOADING EXPERIENCE...", width / 2, pacmanY + 70);
            ctx.restore();

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div style={styles.container}>
            <canvas ref={canvasRef} style={styles.canvas} />
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0a0a0c",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    canvas: {
        display: "block",
        width: "100%",
        height: "100%",
    },
};