"use client";

import React, { useEffect, useRef } from "react";

export interface BalanceBeamScaleProps {
  /** Left pan mass */
  massL?: number;
  /** Right pan mass */
  massR?: number;
  /** Torsional damping */
  damping?: number;
  /** Beam stiffness / inertia */
  inertia?: number;
  size?: number;
  className?: string;
}

/**
 * Analytical balance — torque ODE:
 * I θ̈ + c θ̇ + κ sinθ = g(m_R − m_L)·L/2
 */
export function BalanceBeamScale({
  massL = 1.0,
  massR = 1.05,
  damping = 0.55,
  inertia = 1.2,
  size = 520,
  className = "",
}: BalanceBeamScaleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ massL, massR, damping, inertia });
  params.current = { massL, massR, damping, inertia };

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
    let omega = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      const { massL: mL, massR: mR, damping: c, inertia: I } = params.current;
      const L = 1; // half-beam
      const g = 9.81;
      const kappa = 0.15; // mild restoring from knife-edge geometry
      const torque = g * (mR - mL) * L * 0.5 - kappa * Math.sin(theta);
      const alpha = (torque - c * omega) / I;
      omega += alpha * dt;
      theta += omega * dt;
      // Clamp extreme tip
      if (theta > 0.45) {
        theta = 0.45;
        omega *= -0.2;
      }
      if (theta < -0.45) {
        theta = -0.45;
        omega *= -0.2;
      }

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size * 0.42;
      const beamLen = size * 0.36;

      // Column
      ctx.fillStyle = "#444";
      ctx.fillRect(cx - 14, cy, 28, size * 0.38);
      ctx.fillStyle = "#666";
      ctx.fillRect(cx - 40, size * 0.78, 80, 16);

      // Knife edge fulcrum
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy);
      ctx.lineTo(cx, cy - 14);
      ctx.lineTo(cx + 16, cy);
      ctx.closePath();
      ctx.fillStyle = "#d4af37";
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy - 8);
      ctx.rotate(theta);

      // Beam
      ctx.fillStyle = "#c4b59a";
      ctx.fillRect(-beamLen, -5, beamLen * 2, 10);
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1;
      ctx.strokeRect(-beamLen, -5, beamLen * 2, 10);

      // Pointer
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(0, -40);
      ctx.strokeStyle = "#e8e4d9";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stirrups + pans
      const drawPan = (x: number, mass: number) => {
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, 5);
        ctx.lineTo(x - 20, 55);
        ctx.lineTo(x + 20, 55);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, 62, 28, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#5a5048";
        ctx.fill();
        ctx.strokeStyle = "#111";
        ctx.stroke();
        // Mass block
        const h = 12 + mass * 18;
        ctx.fillStyle = "#c45c26";
        ctx.fillRect(x - 14, 62 - h, 28, h);
        ctx.fillStyle = "#e8e4d9";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(mass.toFixed(2), x, 58);
      };
      drawPan(-beamLen + 10, mL);
      drawPan(beamLen - 10, mR);
      ctx.restore();

      // Scale arc behind pointer
      ctx.strokeStyle = "#333";
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 48, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
      for (let i = -3; i <= 3; i++) {
        const a = -Math.PI / 2 + i * 0.12;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 42, cy - 8 + Math.sin(a) * 42);
        ctx.lineTo(cx + Math.cos(a) * 50, cy - 8 + Math.sin(a) * 50);
        ctx.stroke();
      }

      ctx.fillStyle = "#888";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`θ=${((theta * 180) / Math.PI).toFixed(2)}°  ω=${omega.toFixed(3)}`, 12, 28);
      ctx.fillStyle = "#555";
      ctx.font = "9px monospace";
      ctx.fillText("Iθ̈ + cθ̇ + κsinθ = g(mR−mL)L/2", 12, size - 14);

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
      aria-label="Balance beam scale"
    />
  );
}

export default BalanceBeamScale;
