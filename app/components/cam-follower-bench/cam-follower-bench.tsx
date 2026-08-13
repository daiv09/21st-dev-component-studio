"use client";

import React, { useEffect, useRef } from "react";

export type CamProfile = "plateau" | "harmonic" | "cycloidal" | "dwell";

export interface CamFollowerBenchProps {
  profile?: CamProfile;
  /** Shaft speed rad/s */
  omega?: number;
  /** Spring stiffness */
  k?: number;
  size?: number;
  className?: string;
}

function camRadius(theta: number, profile: CamProfile, base = 50, lift = 35): number {
  const t = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const u = t / (Math.PI * 2); // 0..1
  switch (profile) {
    case "harmonic": {
      // rise 0-0.5, return 0.5-1
      if (u < 0.5) return base + lift * (1 - Math.cos(2 * Math.PI * u)) / 2;
      return base + lift * (1 - Math.cos(2 * Math.PI * (1 - u))) / 2;
    }
    case "cycloidal": {
      if (u < 0.5) {
        const s = u / 0.5;
        return base + lift * (s - Math.sin(2 * Math.PI * s) / (2 * Math.PI));
      }
      const s = (u - 0.5) / 0.5;
      return base + lift * (1 - (s - Math.sin(2 * Math.PI * s) / (2 * Math.PI)));
    }
    case "dwell": {
      if (u < 0.2) return base;
      if (u < 0.45) {
        const s = (u - 0.2) / 0.25;
        return base + lift * (1 - Math.cos(Math.PI * s)) / 2;
      }
      if (u < 0.7) return base + lift;
      if (u < 0.95) {
        const s = (u - 0.7) / 0.25;
        return base + lift * (1 + Math.cos(Math.PI * s)) / 2;
      }
      return base;
    }
    case "plateau":
    default: {
      if (u < 0.15 || u > 0.85) return base;
      if (u < 0.35) {
        const s = (u - 0.15) / 0.2;
        return base + lift * s;
      }
      if (u < 0.65) return base + lift;
      const s = (u - 0.65) / 0.2;
      return base + lift * (1 - s);
    }
  }
}

export function CamFollowerBench({
  profile = "harmonic",
  omega = 1.8,
  k = 0.35,
  size = 520,
  className = "",
}: CamFollowerBenchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ profile, omega, k });
  params.current = { profile, omega, k };

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
    let followerY = 0;
    let followerV = 0;
    let last = performance.now();
    let raf = 0;
    const history: number[] = [];

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { profile: p, omega: w, k: spring } = params.current;
      theta += w * dt;

      const cx = size * 0.38;
      const cy = size * 0.55;
      const rCam = camRadius(theta, p);
      // Follower rides on top of cam
      const contactY = cy - rCam;
      const restY = contactY;
      // Spring-damper toward contact (can't penetrate)
      const target = restY;
      const force = (target - followerY) * spring * 40 - followerV * 8;
      followerV += force * dt;
      followerY += followerV * dt;
      if (followerY > contactY) {
        followerY = contactY;
        followerV *= -0.15;
      }

      history.push(rCam - 50);
      if (history.length > size * 0.45) history.shift();

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      // Cam profile polar plot
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(theta);
      ctx.beginPath();
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const r = camRadius(a, p);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "#8b7355";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.stroke();
      // hub
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#222";
      ctx.fill();
      ctx.fillStyle = "#aaa";
      ctx.fillRect(-3, -18, 6, 36);
      ctx.restore();

      // Follower rod + spring
      const fx = cx;
      const fy = followerY - 20;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx, 60);
      ctx.stroke();
      // roller
      ctx.beginPath();
      ctx.arc(fx, followerY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#d4af37";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.stroke();
      // spring coils (flat zig-zag)
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const springTop = 70;
      const springBot = fy - 4;
      const coils = 8;
      for (let i = 0; i <= coils; i++) {
        const t = i / coils;
        const y = springTop + (springBot - springTop) * t;
        const x = fx + (i % 2 === 0 ? -10 : 10);
        if (i === 0) ctx.moveTo(fx, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // guide
      ctx.strokeStyle = "#444";
      ctx.strokeRect(fx - 16, 50, 32, 30);

      // Displacement scope
      const ox = size * 0.58;
      const oy = 80;
      ctx.strokeStyle = "#333";
      ctx.strokeRect(ox, oy, size * 0.38, 160);
      ctx.fillStyle = "#555";
      ctx.font = "9px monospace";
      ctx.fillText("LIFT SCOPE", ox + 8, oy + 14);
      ctx.beginPath();
      ctx.strokeStyle = "#e8e4d9";
      ctx.lineWidth = 1.5;
      history.forEach((v, i) => {
        const x = ox + i;
        const y = oy + 140 - v * 2.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = "#666";
      ctx.font = "10px monospace";
      ctx.fillText(`θ=${((theta % (Math.PI * 2)) * (180 / Math.PI)).toFixed(0)}°  profile=${p}`, 16, size - 16);

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
      aria-label="Cam follower bench"
    />
  );
}

export default CamFollowerBench;
