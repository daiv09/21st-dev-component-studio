"use client";

import React, { useEffect, useRef } from "react";

export interface PhenakistoscopeDiskProps {
  /** Frames around disk */
  frames?: number;
  /** Rotation speed rad/s */
  omega?: number;
  /** Slit duty (open fraction) for strobe */
  slitDuty?: number;
  /** Animation subject: "walker" | "bird" | "pulse" */
  subject?: "walker" | "bird" | "pulse";
  size?: number;
  className?: string;
}

function frameArtwork(
  ctx: CanvasRenderingContext2D,
  subject: "walker" | "bird" | "pulse",
  frame: number,
  total: number,
  r: number
) {
  const t = frame / total;
  ctx.save();
  if (subject === "walker") {
    const leg = Math.sin(t * Math.PI * 2) * 12;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -18, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.lineTo(-leg, 28);
    ctx.moveTo(0, 10);
    ctx.lineTo(leg, 28);
    ctx.moveTo(0, -2);
    ctx.lineTo(-14, 8);
    ctx.moveTo(0, -2);
    ctx.lineTo(14, 8);
    ctx.stroke();
  } else if (subject === "bird") {
    const wing = Math.sin(t * Math.PI * 2) * 20;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-25, wing * 0.3);
    ctx.quadraticCurveTo(0, -wing, 25, wing * 0.3);
    ctx.moveTo(-20, 5);
    ctx.lineTo(0, 0);
    ctx.lineTo(20, 5);
    ctx.stroke();
  } else {
    const s = 8 + Math.sin(t * Math.PI * 2) * 10;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-s, -s, s * 2, s * 2);
  }
  void r;
  ctx.restore();
}

/**
 * Phenakistoscope: spinning disk + stroboscopic slit shutter reveals animation.
 */
export function PhenakistoscopeDisk({
  frames = 12,
  omega = 2.5,
  slitDuty = 0.12,
  subject = "walker",
  size = 520,
  className = "",
}: PhenakistoscopeDiskProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ frames, omega, slitDuty, subject });
  params.current = { frames, omega, slitDuty, subject };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let angle = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { frames: n, omega: w, slitDuty: duty, subject: sub } = params.current;
      angle += w * dt;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const R = size * 0.4;

      // Disk
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = "#e8e4d9";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 4;
      ctx.stroke();

      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.save();
        ctx.rotate(a);
        ctx.translate(0, -R * 0.62);
        frameArtwork(ctx, sub, i, n, R);
        // Radial slit cut (black wedge on disk edge — classic phenakistoscope)
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const a0 = a - (Math.PI / n) * 0.15;
        const a1 = a + (Math.PI / n) * 0.15;
        ctx.arc(0, 0, R, a0, a1);
        ctx.closePath();
        ctx.fillStyle = "#0a0a0a";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
      ctx.restore();

      // Strobe shutter plate (fixed) — only a slit open
      const slitAngle = -Math.PI / 2;
      const slitW = (Math.PI * 2) / n;
      ctx.fillStyle = "rgba(10,10,10,0.88)";
      ctx.beginPath();
      ctx.rect(0, 0, size, size);
      // punch slit
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R + 20, slitAngle - slitW * duty, slitAngle + slitW * duty);
      ctx.closePath();
      ctx.fill("evenodd");

      // Viewing window outline
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - R * 0.62, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#666";
      ctx.font = "10px monospace";
      ctx.fillText(`STROBE · ${n} FRAMES · ω=${w.toFixed(2)}`, 12, size - 14);

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
      aria-label="Phenakistoscope disk"
    />
  );
}

export default PhenakistoscopeDisk;
