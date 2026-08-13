"use client";

import React, { useMemo } from "react";

export interface SundialGnomonProps {
  latitude?: number;
  hourAngle?: number;
  declination?: number;
  size?: number;
  className?: string;
}

/**
 * Horizontal sundial with style (gnomon) angled at latitude.
 * Hard flat shadow polygon — no soft gradients.
 */
export function SundialGnomon({
  latitude = 40,
  hourAngle = 30,
  declination = 0,
  size = 520,
  className = "",
}: SundialGnomonProps) {
  const phi = (latitude * Math.PI) / 180;
  const H = (hourAngle * Math.PI) / 180;
  const delta = (declination * Math.PI) / 180;

  const geometry = useMemo(() => {
    const cx = size / 2;
    const cy = size * 0.62;
    const plateR = size * 0.38;
    const gnomonLen = plateR * 0.85;
    const styleAngle = phi;
    const denom = Math.sin(phi) * Math.cos(H) - Math.cos(phi) * Math.tan(delta);
    const az = Math.atan2(Math.sin(H), denom);
    const sinAlt =
      Math.sin(phi) * Math.sin(delta) +
      Math.cos(phi) * Math.cos(delta) * Math.cos(H);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const shadowLen =
      alt > 0.05 ? (gnomonLen * Math.cos(styleAngle)) / Math.tan(alt) : plateR * 1.4;

    const tipX = cx;
    const tipY = cy;
    const topX = cx;
    const topY = cy - Math.sin(styleAngle) * gnomonLen;
    const shadowEndX = tipX + Math.sin(az) * Math.min(shadowLen, plateR * 1.3);
    const shadowEndY = tipY - Math.cos(az) * Math.min(shadowLen, plateR * 1.3) * 0.85;

    const hours: { label: string; x: number; y: number }[] = [];
    for (let h = -6; h <= 6; h++) {
      const Ha = (h * 15 * Math.PI) / 180;
      const d = Math.sin(phi) * Math.cos(Ha) - Math.cos(phi) * Math.tan(0);
      const a = Math.atan2(Math.sin(Ha), d || 0.001);
      hours.push({
        label: String((12 + h + 24) % 24),
        x: cx + Math.sin(a) * plateR * 0.92,
        y: cy - Math.cos(a) * plateR * 0.78,
      });
    }

    return { cx, cy, plateR, tipX, tipY, topX, topY, shadowEndX, shadowEndY, hours, alt };
  }, [size, phi, H, delta]);

  const g = geometry;
  const sunUp = g.alt > 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{
        background: "#0a0a0a",
        border: "1px solid #2a2a2a",
        boxShadow: "8px 8px 0 #000",
      }}
    >
      <ellipse cx={g.cx} cy={g.cy} rx={g.plateR} ry={g.plateR * 0.72} fill="#1c1814" stroke="#6b5b4a" strokeWidth="3" />
      <ellipse cx={g.cx} cy={g.cy} rx={g.plateR * 0.88} ry={g.plateR * 0.63} fill="none" stroke="#3a3028" strokeWidth="1" />

      {g.hours.map((h) => (
        <g key={h.label}>
          <line x1={g.cx} y1={g.cy} x2={h.x} y2={h.y} stroke="#4a4038" strokeWidth="1" />
          <text x={h.x} y={h.y} fill="#8a7a6a" fontSize="9" fontFamily="monospace" textAnchor="middle">
            {h.label}
          </text>
        </g>
      ))}

      {sunUp && (
        <polygon
          points={`${g.tipX},${g.tipY} ${g.topX},${g.topY} ${g.shadowEndX},${g.shadowEndY}`}
          fill="#000000"
          opacity={0.85}
        />
      )}

      <polygon
        points={`${g.tipX - 6},${g.tipY} ${g.tipX + 6},${g.tipY} ${g.topX},${g.topY}`}
        fill="#c4b59a"
        stroke="#8b7355"
        strokeWidth="1"
      />
      <line x1={g.tipX} y1={g.tipY} x2={g.topX} y2={g.topY} stroke="#e8e4d9" strokeWidth="2" />

      <text x={g.cx} y={g.cy - g.plateR * 0.85} fill="#aaa" fontSize="11" fontFamily="monospace" textAnchor="middle">
        N
      </text>
      <text x={12} y={28} fill="#888" fontSize="11" fontFamily="monospace">
        LAT {latitude.toFixed(1)}° · STYLE ∠φ
      </text>
      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        {sunUp ? `ALT ${((g.alt * 180) / Math.PI) | 0}° · HARD SHADOW` : "SUN BELOW HORIZON"}
      </text>
    </svg>
  );
}

export default SundialGnomon;
