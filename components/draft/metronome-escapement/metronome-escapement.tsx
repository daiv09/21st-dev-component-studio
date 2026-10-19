"use client";

import React, { useEffect, useRef } from "react";

export interface MetronomeEscapementProps {
  /** Beats per minute */
  bpm?: number;
  /** Running */
  running?: boolean;
  size?: number;
  className?: string;
}

/**
 * Mechanical metronome with verge escapement ticks — pendulum bob + escape wheel.
 */
export function MetronomeEscapement({
  bpm = 96,
  running = true,
  size = 520,
  className = "",
}: MetronomeEscapementProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ bpm, running });
  params.current = { bpm, running };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let phase = 0; // -1..1 pendulum
    let vel = 1;
    let escapeAngle = 0;
    let last = performance.now();
    let raf = 0;
    let flash = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { bpm: b, running: run } = params.current;
      const omega = ((b / 60) * Math.PI); // half-cycle per beat

      if (run) {
        // Escapement impulse near extremes
        phase += vel * omega * dt;
        if (phase > 1) {
          phase = 1;
          vel = -1;
          escapeAngle += Math.PI / 6;
          flash = 1;
        } else if (phase < -1) {
          phase = -1;
          vel = 1;
          escapeAngle += Math.PI / 6;
          flash = 1;
        }
        flash *= Math.exp(-dt * 8);
      }

      // Pendulum angle (visual)
      const maxAng = 0.35;
      const ang = phase * maxAng;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      const cx = size / 2;
      const baseY = size * 0.82;
      const pivotY = size * 0.28;

      // Pyramid body
      ctx.beginPath();
      ctx.moveTo(cx - 90, baseY);
      ctx.lineTo(cx + 90, baseY);
      ctx.lineTo(cx + 30, pivotY - 20);
      ctx.lineTo(cx - 30, pivotY - 20);
      ctx.closePath();
      ctx.fillStyle = "#2a2420";
      ctx.fill();
      ctx.strokeStyle = "#6b5b4a";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Scale marks
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const a = (i / 4) * maxAng;
        ctx.beginPath();
        ctx.moveTo(cx + Math.sin(a) * 40, pivotY + 30);
        ctx.lineTo(cx + Math.sin(a) * 55, pivotY + 50);
        ctx.stroke();
      }

      // Escape wheel
      const ewX = cx;
      const ewY = baseY - 50;
      ctx.save();
      ctx.translate(ewX, ewY);
      ctx.rotate(escapeAngle);
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a0 = (i / 12) * Math.PI * 2;
        const a1 = a0 + Math.PI / 12;
        ctx.lineTo(Math.cos(a0) * 22, Math.sin(a0) * 22);
        ctx.lineTo(Math.cos(a1) * 28, Math.sin(a1) * 28);
      }
      ctx.closePath();
      ctx.fillStyle = "#8b7355";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.stroke();
      ctx.restore();

      // Pendulum rod + bob + weight
      ctx.save();
      ctx.translate(cx, pivotY);
      ctx.rotate(ang);
      ctx.strokeStyle = "#c4b59a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 200);
      ctx.stroke();
      // Sliding weight (tempo)
      const wY = 60 + (200 - b) * 0.4;
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(-12, wY, 24, 18);
      // Bob
      ctx.beginPath();
      ctx.arc(0, 210, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#c45c26";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Escapement pallets
      ctx.fillStyle = flash > 0.3 ? "#e8e4d9" : "#888";
      ctx.fillRect(-28, 175, 14, 8);
      ctx.fillRect(14, 175, 14, 8);
      ctx.restore();

      // Pivot
      ctx.beginPath();
      ctx.arc(cx, pivotY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#aaa";
      ctx.fill();

      ctx.fillStyle = "#888";
      ctx.font = "14px monospace";
      ctx.fillText(`${b} BPM`, 16, 32);
      ctx.fillStyle = "#555";
      ctx.font = "10px monospace";
      ctx.fillText("VERGE ESCAPEMENT", 16, size - 16);

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
      aria-label="Metronome escapement"
    />
  );
}

export default MetronomeEscapement;
