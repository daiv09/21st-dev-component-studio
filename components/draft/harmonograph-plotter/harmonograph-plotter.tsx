"use client";

import React, { useEffect, useRef, useCallback } from "react";

export interface HarmonographPlotterProps {
  /** Frequency of pendulum A (Hz) */
  freqA?: number;
  /** Frequency of pendulum B (Hz) */
  freqB?: number;
  /** Phase offset of A (radians) */
  phaseA?: number;
  /** Phase offset of B (radians) */
  phaseB?: number;
  /** Damping coefficient (higher = faster decay) */
  damping?: number;
  /** Amplitude scale 0–1 */
  amplitude?: number;
  /** Stroke color */
  color?: string;
  /** Background */
  background?: string;
  /** Width/height of the SVG viewport */
  size?: number;
  /** Whether the plot is actively drawing */
  running?: boolean;
  /** Seconds of simulation per real second */
  timeScale?: number;
  className?: string;
}

/**
 * Dual-pendulum harmonograph: damped Lissajous curves.
 * x(t) = A·sin(ωₐt + φₐ)·e^(-d·t)
 * y(t) = A·sin(ωᵦt + φᵦ)·e^(-d·t)
 */
export function HarmonographPlotter({
  freqA = 3,
  freqB = 2,
  phaseA = 0,
  phaseB = Math.PI / 2,
  damping = 0.008,
  amplitude = 0.92,
  color = "#e8e4d9",
  background = "#0a0a0a",
  size = 520,
  running = true,
  timeScale = 1,
  className = "",
}: HarmonographPlotterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const propsRef = useRef({
    freqA,
    freqB,
    phaseA,
    phaseB,
    damping,
    amplitude,
    color,
    timeScale,
    running,
  });

  propsRef.current = {
    freqA,
    freqB,
    phaseA,
    phaseB,
    damping,
    amplitude,
    color,
    timeScale,
    running,
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    tRef.current = 0;
    lastPt.current = null;
  }, [background]);

  // Clear when math params change significantly
  useEffect(() => {
    clear();
  }, [freqA, freqB, phaseA, phaseB, damping, amplitude, clear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);

    let lastTs = performance.now();

    const tick = (now: number) => {
      const p = propsRef.current;
      const dt = Math.min((now - lastTs) / 1000, 0.05) * p.timeScale;
      lastTs = now;

      if (p.running) {
        const steps = Math.max(1, Math.floor(dt * 240));
        const stepDt = dt / steps;
        const cx = size / 2;
        const cy = size / 2;
        const amp = (size / 2) * p.amplitude * 0.95;

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();

        for (let i = 0; i < steps; i++) {
          tRef.current += stepDt;
          const t = tRef.current;
          const decay = Math.exp(-p.damping * t);
          const x =
            cx +
            amp *
              Math.sin(2 * Math.PI * p.freqA * t + p.phaseA) *
              decay;
          const y =
            cy +
            amp *
              Math.sin(2 * Math.PI * p.freqB * t + p.phaseB) *
              decay;

          if (lastPt.current) {
            if (i === 0) ctx.moveTo(lastPt.current.x, lastPt.current.y);
            ctx.lineTo(x, y);
          }
          lastPt.current = { x, y };
        }
        ctx.stroke();

        // Fade trail slightly for long runs (flat dark overlay, not a gradient)
        if (tRef.current > 40 && Math.random() < 0.02) {
          ctx.fillStyle = "rgba(10,10,10,0.04)";
          ctx.fillRect(0, 0, size, size);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, background]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        display: "block",
        background,
        boxShadow: "8px 8px 0 #000",
        border: "1px solid #2a2a2a",
      }}
      aria-label="Harmonograph plotter canvas"
    />
  );
}

export default HarmonographPlotter;
