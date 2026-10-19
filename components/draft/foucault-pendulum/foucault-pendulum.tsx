"use client";

import React, { useEffect, useRef } from "react";

export interface FoucaultPendulumProps {
  /** Latitude in degrees (−90..90). Precession Ω = −ω·sin(φ) */
  latitude?: number;
  /** Swing amplitude px */
  amplitude?: number;
  /** Pendulum period seconds */
  period?: number;
  size?: number;
  className?: string;
}

/**
 * Foucault pendulum with Earth-precession of the swing plane
 * and a hard-etched floor rose showing the trail.
 */
export function FoucaultPendulum({
  latitude = 48.8,
  amplitude = 160,
  period = 4.5,
  size = 520,
  className = "",
}: FoucaultPendulumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ latitude, amplitude, period });
  params.current = { latitude, amplitude, period };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const trail: { x: number; y: number }[] = [];
    const t0 = performance.now();
    let raf = 0;
    const cx = size / 2;
    const cy = size / 2 + 20;

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const { latitude: lat, amplitude: A, period: T } = params.current;
      const phi = (lat * Math.PI) / 180;
      // Precession rate (visualized faster than real Earth)
      const Omega = -Math.sin(phi) * 0.15;
      const omega = (2 * Math.PI) / T;
      const plane = Omega * t;
      const swing = A * Math.sin(omega * t);
      const bobX = cx + Math.cos(plane) * swing;
      const bobY = cy + Math.sin(plane) * swing * 0.35; // foreshortened floor

      trail.push({ x: bobX, y: bobY });
      if (trail.length > 900) trail.shift();

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      // Floor etch (rose)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * A * 1.15, Math.sin(a) * A * 0.4);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(0, 0, A * 1.15, A * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, A * 0.7, A * 0.24, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Trail etch
      ctx.beginPath();
      ctx.strokeStyle = "#5a5040";
      ctx.lineWidth = 1;
      trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Suspension
      const pivotX = cx;
      const pivotY = 40;
      ctx.strokeStyle = "#777";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY - 8);
      ctx.stroke();
      ctx.fillStyle = "#333";
      ctx.fillRect(pivotX - 30, 28, 60, 10);

      // Bob
      ctx.beginPath();
      ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#c45c26";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shadow (hard ellipse)
      ctx.beginPath();
      ctx.ellipse(bobX + 6, bobY + 10, 16, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();

      ctx.fillStyle = "#666";
      ctx.font = "10px monospace";
      ctx.fillText(`φ=${lat.toFixed(1)}°  Ω∝−sin(φ)  plane=${((plane * 180) / Math.PI).toFixed(1)}°`, 12, size - 14);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
        display: "block",
        border: "1px solid #2a2a2a",
        boxShadow: "8px 8px 0 #000",
      }}
      aria-label="Foucault pendulum"
    />
  );
}

export default FoucaultPendulum;
