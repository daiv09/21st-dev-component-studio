"use client";

import React, { useEffect, useRef } from "react";

export interface PhonographGrooveProps {
  /** Playback angular velocity */
  omega?: number;
  /** Groove pitch (radial spacing) */
  pitch?: number;
  /** Modulation depth (audio wavy) */
  modulation?: number;
  /** Playing */
  playing?: boolean;
  size?: number;
  className?: string;
}

/**
 * Spiral groove phonograph with stylus scope — radial r = r0 − pitch·θ/(2π) + mod·sin(kθ).
 */
export function PhonographGroove({
  omega = 1.2,
  pitch = 4.5,
  modulation = 2.2,
  playing = true,
  size = 520,
  className = "",
}: PhonographGrooveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ omega, pitch, modulation, playing });
  params.current = { omega, pitch, modulation, playing };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let theta = 0;
    let last = performance.now();
    let raf = 0;
    const scope: number[] = [];

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { omega: w, pitch: p, modulation: m, playing: play } = params.current;
      if (play) theta += w * dt;

      const cx = size * 0.42;
      const cy = size / 2;
      const R0 = size * 0.36;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      // Record platter
      ctx.beginPath();
      ctx.arc(cx, cy, R0 + 8, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spiral groove
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(theta);
      ctx.beginPath();
      const turns = Math.floor(R0 / p) - 2;
      const steps = turns * 80;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * turns * Math.PI * 2;
        const r = R0 - (p * t) / (Math.PI * 2) + m * Math.sin(t * 7.3);
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fillStyle = "#c45c26";
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SIDE A", 0, 3);
      ctx.restore();

      // Stylus arm
      const stylusR = R0 - (p * (theta % (turns * Math.PI * 2 / turns))) / (Math.PI * 2);
      // Simplified: stylus sits on outer-mid groove, wobbles with modulation
      const playTheta = -theta;
      const rNow = R0 * 0.55 + m * Math.sin(theta * 7.3);
      const sx = cx + Math.cos(playTheta) * rNow * 0;
      // Fixed arm from right, tip tracks vertical modulation
      const armPivotX = size * 0.82;
      const armPivotY = cy - 40;
      const tipX = cx + R0 * 0.55;
      const tipY = cy + m * Math.sin(theta * 7.3) * 3;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(armPivotX, armPivotY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.fillStyle = "#d4af37";
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#555";
      ctx.fillRect(armPivotX - 12, armPivotY - 12, 24, 24);

      // Scope signal
      const sample = Math.sin(theta * 7.3) * m + Math.sin(theta * 13.1) * m * 0.4;
      scope.push(sample);
      if (scope.length > 160) scope.shift();

      const ox = size * 0.62;
      const oy = size * 0.72;
      ctx.strokeStyle = "#333";
      ctx.strokeRect(ox, oy, 160, 60);
      ctx.fillStyle = "#555";
      ctx.font = "8px monospace";
      ctx.textAlign = "left";
      ctx.fillText("STYLUS SCOPE", ox + 6, oy + 12);
      ctx.beginPath();
      ctx.strokeStyle = "#e8e4d9";
      ctx.lineWidth = 1.5;
      scope.forEach((v, i) => {
        const x = ox + i;
        const y = oy + 35 + v * 4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      void sx;
      void stylusR;

      ctx.fillStyle = "#666";
      ctx.font = "10px monospace";
      ctx.fillText(`ω=${w.toFixed(2)}  pitch=${p.toFixed(1)}`, 12, size - 14);

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
      aria-label="Phonograph groove"
    />
  );
}

export default PhonographGroove;
