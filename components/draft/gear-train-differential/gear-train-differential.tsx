"use client";

import React, { useEffect, useRef } from "react";

export interface GearTrainDifferentialProps {
  /** Input shaft A angular velocity (rad/s) */
  omegaA?: number;
  /** Input shaft B angular velocity (rad/s) */
  omegaB?: number;
  /** Show tooth mesh overlay */
  showTeeth?: boolean;
  size?: number;
  className?: string;
}

/**
 * Spur gear train ending in a true bevel differential.
 * Carrier ω_c = (ω_A + ω_B) / 2
 * Relative spin ω_rel = (ω_A − ω_B) / 2
 */
export function GearTrainDifferential({
  omegaA = 1.2,
  omegaB = 0.6,
  showTeeth = true,
  size = 520,
  className = "",
}: GearTrainDifferentialProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ omegaA, omegaB, showTeeth });
  params.current = { omegaA, omegaB, showTeeth };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let angleA = 0;
    let angleB = 0;
    let angleIdler = 0;
    let angleCarrier = 0;
    let angleSpider = 0;
    let last = performance.now();
    let raf = 0;

    const drawGear = (
      x: number,
      y: number,
      r: number,
      teeth: number,
      rot: number,
      fill: string,
      toothDepth = 8
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2;
        const a1 = ((i + 0.45) / teeth) * Math.PI * 2;
        const a2 = ((i + 0.55) / teeth) * Math.PI * 2;
        const a3 = ((i + 1) / teeth) * Math.PI * 2;
        const rOut = r + toothDepth;
        if (i === 0) ctx.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
        ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
        ctx.lineTo(Math.cos(a1) * rOut, Math.sin(a1) * rOut);
        ctx.lineTo(Math.cos(a2) * rOut, Math.sin(a2) * rOut);
        ctx.lineTo(Math.cos(a3) * r, Math.sin(a3) * r);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();
      ctx.strokeStyle = "#555";
      ctx.stroke();
      // key flat
      ctx.fillStyle = "#888";
      ctx.fillRect(-3, -r * 0.2, 6, r * 0.4);
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { omegaA: wA, omegaB: wB, showTeeth: teethOn } = params.current;

      angleA += wA * dt;
      angleB += wB * dt;
      // Idler meshes with A (opposite)
      angleIdler -= wA * (36 / 24) * dt;
      // Differential
      const wC = (wA + wB) / 2;
      const wRel = (wA - wB) / 2;
      angleCarrier += wC * dt;
      angleSpider += wRel * dt;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      // Labels
      ctx.fillStyle = "#666";
      ctx.font = "10px monospace";
      ctx.fillText("INPUT A", 40, 36);
      ctx.fillText("INPUT B", size - 100, 36);
      ctx.fillText(`ωc=${wC.toFixed(2)}  ωrel=${wRel.toFixed(2)}`, size / 2 - 70, size - 20);

      // Gear train left: A -> idler -> ring stub
      const gA = { x: 110, y: size / 2, r: 48, teeth: 36 };
      const gI = { x: 200, y: size / 2, r: 32, teeth: 24 };
      drawGear(gA.x, gA.y, gA.r, teethOn ? gA.teeth : 0, angleA, "#8b7355", teethOn ? 7 : 0);
      if (!teethOn) {
        ctx.beginPath();
        ctx.arc(gA.x, gA.y, gA.r, 0, Math.PI * 2);
        ctx.fillStyle = "#8b7355";
        ctx.fill();
      }
      drawGear(gI.x, gI.y, gI.r, teethOn ? gI.teeth : 0, angleIdler, "#6b5b4a", teethOn ? 6 : 0);

      // Right input B
      const gB = { x: size - 110, y: size / 2, r: 48, teeth: 36 };
      drawGear(gB.x, gB.y, gB.r, teethOn ? gB.teeth : 0, angleB, "#5a6b5a", teethOn ? 7 : 0);

      // Differential carrier (center)
      const cx = size / 2;
      const cy = size / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleCarrier);
      // Carrier cage
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 4;
      ctx.strokeRect(-55, -55, 110, 110);
      ctx.fillStyle = "#222";
      ctx.fillRect(-50, -50, 100, 100);
      // Side gears (driven by A/B conceptually)
      ctx.rotate(-angleCarrier);
      // Spider pinion
      ctx.rotate(angleCarrier);
      ctx.save();
      ctx.rotate(angleSpider);
      ctx.fillStyle = "#d4af37";
      ctx.beginPath();
      ctx.arc(0, -28, 16, 0, Math.PI * 2);
      ctx.arc(0, 28, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(-2, -40, 4, 80);
      ctx.restore();
      // Axle stubs
      ctx.fillStyle = "#888";
      ctx.fillRect(-70, -4, 40, 8);
      ctx.fillRect(30, -4, 40, 8);
      ctx.restore();

      // Drive shafts
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(gA.x + gA.r + 8, cy);
      ctx.lineTo(cx - 70, cy);
      ctx.moveTo(gB.x - gB.r - 8, cy);
      ctx.lineTo(cx + 70, cy);
      ctx.stroke();

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
      aria-label="Gear train differential"
    />
  );
}

export default GearTrainDifferential;
