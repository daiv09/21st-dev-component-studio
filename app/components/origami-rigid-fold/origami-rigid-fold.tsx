"use client";

import React, { useMemo } from "react";

export interface OrigamiRigidFoldProps {
  /** Fold progress 0–1 (flat → folded) */
  fold?: number;
  /** Dihedral target degrees when fully folded */
  dihedral?: number;
  /** Pattern: "waterbomb" | "miura" | "preliminary" */
  pattern?: "waterbomb" | "miura" | "preliminary";
  size?: number;
  className?: string;
}

type V3 = [number, number, number];

function rotAxis(v: V3, axis: V3, ang: number): V3 {
  // Rodrigues
  const [x, y, z] = v;
  const [ux, uy, uz] = axis;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [
    x * (c + ux * ux * (1 - c)) + y * (ux * uy * (1 - c) - uz * s) + z * (ux * uz * (1 - c) + uy * s),
    x * (uy * ux * (1 - c) + uz * s) + y * (c + uy * uy * (1 - c)) + z * (uy * uz * (1 - c) - ux * s),
    x * (uz * ux * (1 - c) - uy * s) + y * (uz * uy * (1 - c) + ux * s) + z * (c + uz * uz * (1 - c)),
  ];
}

function project(v: V3, size: number) {
  const f = 500;
  const z = v[2] + 400;
  const s = f / z;
  return { x: size / 2 + v[0] * s, y: size / 2 - v[1] * s + 20, z: v[2] };
}

/**
 * Rigid origami fold — panels rotate about crease axes with dihedral angles.
 * Canvas projection fallback (no R3F).
 */
export function OrigamiRigidFold({
  fold = 0.55,
  dihedral = 90,
  pattern = "waterbomb",
  size = 520,
  className = "",
}: OrigamiRigidFoldProps) {
  const faces = useMemo(() => {
    const S = 110;
    const ang = -((dihedral * Math.PI) / 180) * fold;

    if (pattern === "miura") {
      // Simplified Miura-ori unit: parallelogram panels
      const panels: { pts: V3[]; color: string }[] = [];
      const cols = 3;
      const rows = 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = (c - 1.5) * S * 0.7;
          const y0 = (r - 0.5) * S * 0.6;
          const mountain = (c + r) % 2 === 0;
          const a = mountain ? ang : -ang * 0.8;
          let pts: V3[] = [
            [x0, y0, 0],
            [x0 + S * 0.7, y0 + (c % 2 ? 12 : -12), 0],
            [x0 + S * 0.7, y0 + S * 0.55 + (c % 2 ? 12 : -12), 0],
            [x0, y0 + S * 0.55, 0],
          ];
          const axis: V3 = [0, 1, 0];
          const hinge: V3 = [x0, y0 + S * 0.27, 0];
          pts = pts.map((p) => {
            const d: V3 = [p[0] - hinge[0], p[1] - hinge[1], p[2] - hinge[2]];
            const rd = rotAxis(d, axis, a * (c > 0 ? 1 : 0));
            return [rd[0] + hinge[0], rd[1] + hinge[1], rd[2] + hinge[2]] as V3;
          });
          // View tilt
          pts = pts.map((p) => rotAxis(p, [1, 0, 0], 0.5));
          panels.push({
            pts,
            color: mountain ? "#e8e4d9" : "#c4b59a",
          });
        }
      }
      return panels;
    }

    if (pattern === "preliminary") {
      // Square with diagonals — preliminary fold base
      const corners: V3[] = [
        [-S, -S, 0],
        [S, -S, 0],
        [S, S, 0],
        [-S, S, 0],
      ];
      const mid = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
      const center: V3 = [0, 0, 0];
      const tris = [
        [corners[0], mid(corners[0], corners[1]), center],
        [mid(corners[0], corners[1]), corners[1], center],
        [corners[1], mid(corners[1], corners[2]), center],
        [mid(corners[1], corners[2]), corners[2], center],
        [corners[2], mid(corners[2], corners[3]), center],
        [mid(corners[2], corners[3]), corners[3], center],
        [corners[3], mid(corners[3], corners[0]), center],
        [mid(corners[3], corners[0]), corners[0], center],
      ];
      return tris.map((t, i) => {
        const axis: V3 = [
          t[1][0] - t[0][0],
          t[1][1] - t[0][1],
          0,
        ];
        const len = Math.hypot(axis[0], axis[1]) || 1;
        const ax: V3 = [axis[0] / len, axis[1] / len, 0];
        const pts = t.map((p, pi) => {
          if (pi < 2) return rotAxis(p, [1, 0, 0], 0.4);
          const d: V3 = [p[0] - t[0][0], p[1] - t[0][1], p[2]];
          const rd = rotAxis(d, ax, ang * (i % 2 === 0 ? 1 : -1));
          return rotAxis(
            [rd[0] + t[0][0], rd[1] + t[0][1], rd[2]] as V3,
            [1, 0, 0],
            0.4
          );
        });
        return { pts, color: i % 2 === 0 ? "#e8e4d9" : "#a09070" };
      });
    }

    // waterbomb base — 4 triangular flaps
    const flaps: { pts: V3[]; color: string }[] = [];
    for (let i = 0; i < 4; i++) {
      const a0 = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const a1 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
      let pts: V3[] = [
        [0, 0, 0],
        [Math.cos(a0) * S, Math.sin(a0) * S, 0],
        [Math.cos(a1) * S, Math.sin(a1) * S, 0],
      ];
      const hingeDir: V3 = [
        Math.cos((a0 + a1) / 2 + Math.PI / 2),
        Math.sin((a0 + a1) / 2 + Math.PI / 2),
        0,
      ];
      // Fold about radial crease from origin to mid-edge... actually about edge 1-2 for waterbomb collapse
      const axis: V3 = [
        pts[2][0] - pts[1][0],
        pts[2][1] - pts[1][1],
        0,
      ];
      const al = Math.hypot(axis[0], axis[1]) || 1;
      const ax: V3 = [axis[0] / al, axis[1] / al, 0];
      pts = pts.map((p, pi) => {
        if (pi !== 0) return p;
        const rd = rotAxis(p, ax, ang);
        return rd;
      });
      // Also lift via mountain folds
      pts = pts.map((p) => {
        const r = Math.hypot(p[0], p[1]);
        const lifted: V3 = [p[0], p[1], p[2] + Math.abs(Math.sin(ang)) * (r * 0.3)];
        return rotAxis(lifted, [1, 0, 0], 0.55);
      });
      void hingeDir;
      flaps.push({ pts, color: i % 2 === 0 ? "#e8e4d9" : "#c4b59a" });
    }
    return flaps;
  }, [fold, dihedral, pattern]);

  const projected = faces.map((f) => ({
    ...f,
    screen: f.pts.map((p) => project(p, size)),
    depth: f.pts.reduce((s, p) => s + p[2], 0) / f.pts.length,
  }));
  projected.sort((a, b) => a.depth - b.depth);

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
      {projected.map((f, i) => (
        <polygon
          key={i}
          points={f.screen.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={f.color}
          stroke="#111"
          strokeWidth="1.5"
        />
      ))}
      <text x={12} y={28} fill="#888" fontSize="11" fontFamily="monospace">
        {pattern.toUpperCase()} · FOLD {(fold * 100) | 0}% · θ={dihedral}°
      </text>
      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        RIGID DIHEDRAL · RODRIGUES ROTATION
      </text>
    </svg>
  );
}

export default OrigamiRigidFold;
