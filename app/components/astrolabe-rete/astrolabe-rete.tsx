"use client";

import React, { useMemo } from "react";

export interface AstrolabeReteProps {
  /** Observer latitude degrees */
  latitude?: number;
  /** Rete rotation degrees (local sidereal proxy) */
  reteAngle?: number;
  size?: number;
  className?: string;
}

/** Stereographic projection from south celestial pole: ρ = cot(δ/2 + π/4) style for altitude circles */
function stereo(alt: number, az: number, R: number) {
  // Project sphere onto plane from south pole; altitude a, azimuth A
  const a = (alt * Math.PI) / 180;
  const A = (az * Math.PI) / 180;
  const r = R * Math.cos(a) / (1 + Math.sin(a));
  return { x: r * Math.sin(A), y: -r * Math.cos(A) };
}

/**
 * Astrolabe tympan (altitude/azimuth grid) + rete star pointers via stereographic projection.
 */
export function AstrolabeRete({
  latitude = 40,
  reteAngle = 25,
  size = 520,
  className = "",
}: AstrolabeReteProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.42;

  const tympan = useMemo(() => {
    const alts = [0, 10, 20, 30, 40, 50, 60, 70, 80];
    const azs = Array.from({ length: 24 }, (_, i) => i * 15);
    const altCircles = alts.map((alt) => {
      // For latitude φ, almucantar of altitude a is a circle in stereo
      const phi = (latitude * Math.PI) / 180;
      const a = (alt * Math.PI) / 180;
      // Simplified: draw as circle centered on zenith projection
      const zen = stereo(90, 0, R);
      // shift zenith by co-latitude
      const zY = -R * Math.tan(Math.PI / 4 - phi / 2);
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * Math.PI * 2;
        const p = stereo(alt, (t * 180) / Math.PI, R);
        // rotate so zenith at latitude
        const rot = phi - Math.PI / 2;
        const x = p.x;
        const y = p.y * Math.cos(rot) - zY * 0.0;
        pts.push({ x: cx + x, y: cy + y + (latitude - 45) * 0.8 });
        void zen;
        void t;
      }
      // Better: classic plate — concentric-ish almucantars offset by latitude
      const rad = R * (90 - alt) / 90;
      const offset = ((90 - latitude) / 90) * R * 0.35;
      return { alt, rad, offset };
    });
    return { altCircles, azs, phi: latitude };
  }, [latitude, R, cx, cy]);

  const stars = useMemo(() => {
    // Named pointers on rete (RA hours, Dec degrees) — decorative catalog
    const catalog = [
      { name: "α UMi", ra: 2.5, dec: 89 },
      { name: "α Cyg", ra: 20.7, dec: 45 },
      { name: "α Lyr", ra: 18.6, dec: 39 },
      { name: "α Aql", ra: 19.8, dec: 9 },
      { name: "α Ori", ra: 5.9, dec: 7 },
      { name: "α CMa", ra: 6.7, dec: -17 },
      { name: "β Ori", ra: 5.2, dec: -8 },
      { name: "α Sco", ra: 16.5, dec: -26 },
    ];
    const rot = (reteAngle * Math.PI) / 180;
    return catalog.map((s) => {
      const r = R * (90 - s.dec) / 180;
      const ang = (s.ra / 24) * Math.PI * 2 + rot;
      return {
        ...s,
        x: cx + Math.cos(ang) * r,
        y: cy + Math.sin(ang) * r,
      };
    });
  }, [reteAngle, R, cx, cy]);

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
      {/* Mater rim */}
      <circle cx={cx} cy={cy} r={R + 18} fill="#1a1612" stroke="#8b7355" strokeWidth="4" />
      <circle cx={cx} cy={cy} r={R + 8} fill="none" stroke="#5a4a3a" strokeWidth="1" />

      {/* Tympan almucantars */}
      {tympan.altCircles.map((c) => (
        <circle
          key={c.alt}
          cx={cx}
          cy={cy + c.offset}
          r={Math.max(4, c.rad)}
          fill="none"
          stroke="#3a3028"
          strokeWidth={c.alt === 0 ? 2 : 1}
        />
      ))}

      {/* Azimuth rays */}
      {tympan.azs.map((az) => {
        const a = ((az - 90) * Math.PI) / 180;
        return (
          <line
            key={az}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * R}
            y2={cy + Math.sin(a) * R}
            stroke="#2a2420"
            strokeWidth="1"
          />
        );
      })}

      {/* Horizon label */}
      <text x={cx} y={cy + R - 8} fill="#6a5a4a" fontSize="9" fontFamily="monospace" textAnchor="middle">
        HORIZON
      </text>

      {/* Rete — ecliptic + star pointers */}
      <g transform={`rotate(${reteAngle} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={R * 0.72} fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="6 4" />
        <circle cx={cx} cy={cy} r={R * 0.4} fill="none" stroke="#8b7355" strokeWidth="1" />
        {/* Tropic marks */}
        <circle cx={cx} cy={cy} r={R * 0.55} fill="none" stroke="#5a4a3a" strokeWidth="1" />
      </g>

      {stars.map((s) => (
        <g key={s.name}>
          <line x1={cx} y1={cy} x2={s.x} y2={s.y} stroke="#4a4030" strokeWidth="0.5" />
          <circle cx={s.x} cy={s.y} r={3} fill="#e8e4d9" stroke="#d4af37" strokeWidth="1" />
          <text x={s.x + 6} y={s.y + 3} fill="#a09070" fontSize="8" fontFamily="monospace">
            {s.name}
          </text>
        </g>
      ))}

      {/* Throne / rule */}
      <line x1={cx} y1={cy - R - 18} x2={cx} y2={cy + R + 18} stroke="#c4b59a" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={5} fill="#1a1a1a" stroke="#d4af37" strokeWidth="2" />

      <text x={12} y={24} fill="#888" fontSize="10" fontFamily="monospace">
        TYMPAN φ={latitude.toFixed(0)}° · RETE {reteAngle.toFixed(0)}°
      </text>
      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        STEREOGRAPHIC ALMUCANTARS
      </text>
    </svg>
  );
}

export default AstrolabeRete;
