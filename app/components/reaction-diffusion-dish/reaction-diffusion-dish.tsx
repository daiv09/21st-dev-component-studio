"use client";

import React, { useEffect, useRef } from "react";

export interface ReactionDiffusionDishProps {
  /** Feed rate f */
  feed?: number;
  /** Kill rate k */
  kill?: number;
  /** Diffusion Du */
  Du?: number;
  /** Diffusion Dv */
  Dv?: number;
  /** Grid resolution */
  resolution?: number;
  size?: number;
  running?: boolean;
  className?: string;
}

/**
 * Gray-Scott reaction-diffusion — two-tone ink only (no gradients).
 * ∂u/∂t = Du∇²u − uv² + f(1−u)
 * ∂v/∂t = Dv∇²v + uv² − (f+k)v
 */
export function ReactionDiffusionDish({
  feed = 0.037,
  kill = 0.06,
  Du = 0.16,
  Dv = 0.08,
  resolution = 128,
  size = 520,
  running = true,
  className = "",
}: ReactionDiffusionDishProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ feed, kill, Du, Dv, running });
  params.current = { feed, kill, Du, Dv, running };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const n = resolution;
    canvas.width = n;
    canvas.height = n;

    let u = new Float32Array(n * n);
    let v = new Float32Array(n * n);
    let u2 = new Float32Array(n * n);
    let v2 = new Float32Array(n * n);

    // Init: u=1, v=0 with seed square
    for (let i = 0; i < n * n; i++) {
      u[i] = 1;
      v[i] = 0;
    }
    const mid = n >> 1;
    for (let y = mid - 8; y < mid + 8; y++) {
      for (let x = mid - 8; x < mid + 8; x++) {
        u[y * n + x] = 0.5;
        v[y * n + x] = 0.25 + Math.random() * 0.1;
      }
    }

    const img = ctx.createImageData(n, n);
    let raf = 0;

    const idx = (x: number, y: number) => ((y + n) % n) * n + ((x + n) % n);

    const lap = (arr: Float32Array, x: number, y: number) => {
      return (
        arr[idx(x + 1, y)] +
        arr[idx(x - 1, y)] +
        arr[idx(x, y + 1)] +
        arr[idx(x, y - 1)] -
        4 * arr[idx(x, y)]
      );
    };

    const tick = () => {
      const { feed: f, kill: k, Du: du, Dv: dv, running: run } = params.current;
      if (run) {
        for (let step = 0; step < 4; step++) {
          for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
              const i = y * n + x;
              const uvv = u[i] * v[i] * v[i];
              u2[i] = u[i] + du * lap(u, x, y) - uvv + f * (1 - u[i]);
              v2[i] = v[i] + dv * lap(v, x, y) + uvv - (f + k) * v[i];
            }
          }
          [u, u2] = [u2, u];
          [v, v2] = [v2, v];
        }

        // Two-tone ink: threshold v
        for (let i = 0; i < n * n; i++) {
          const on = v[i] > 0.2;
          const o = i * 4;
          if (on) {
            img.data[o] = 18;
            img.data[o + 1] = 16;
            img.data[o + 2] = 14;
          } else {
            img.data[o] = 232;
            img.data[o + 1] = 228;
            img.data[o + 2] = 217;
          }
          img.data[o + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [resolution]);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        border: "1px solid #2a2a2a",
        boxShadow: "8px 8px 0 #000",
        background: "#0a0a0a",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
          borderRadius: "50%",
          border: "3px solid #5a4a3a",
        }}
        aria-label="Reaction diffusion dish"
      />
    </div>
  );
}

export default ReactionDiffusionDish;
