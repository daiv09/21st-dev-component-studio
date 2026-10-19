import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, mix, poly, proj, shade, text, type View } from "../../kit/iso";
import { clamp, damp, smooth } from "../../kit/motion";
import { fbm, noise2 } from "../../kit/noise";

/**
 * Revenue Velocity Terrain — MRR across time (x) and cohort/segment (y) as a height field.
 * A sweep front scrubs left→right: columns behind it rise from a flat contour map into 3D cliffs.
 * Pointer X scrubs the front; idle it sweeps back and forth. ←/→ nudges it.
 */
const NX = 32, NY = 14, QX = 0.42, QY = 0.56, ZMAX = 5.6, BANDS = 9;
export function mount(c: EngineCtx): EngineInstance {
  const nz = noise2(23);
  const raw = Array.from({ length: NY }, (_, j) => Array.from({ length: NX }, (_, i) => {
    const u = i / (NX - 1), cohort = Math.sin(((j + 0.5) / NY) * Math.PI) ** 0.8;
    return clamp((0.04 + 0.96 * Math.pow(u, 2.3)) * (0.35 + 0.65 * cohort) * (0.75 + 0.25 * fbm(nz, i * 0.25, j * 0.45, 3) * 2));
  }));
  const hz = Array.from({ length: NY }, () => new Float32Array(NX));
  let front = 0.5, manual: number | null = null;
  const frame = (dt: number, t: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    const goal = manual ?? (p.inside ? p.x : 0.5 + 0.5 * Math.sin(t * 0.28 * (0.4 + (c.opts().intensity ?? 0.5))));
    front = damp(front, goal, 6, dt);
    const s = Math.min(w / 21, h / 12);
    const v: View = { s: s, ox: w / 2 - 0.2 * s, oy: h * 0.64 };
    const X0 = -NX * QX / 2, Y0 = -NY * QY / 2;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const m = smooth(clamp((front * (NX + 8) - 4 - i) / 7 + 0.5));
      hz[j][i] = raw[j][i] * ZMAX * m;
    }
    const P = (i: number, j: number) => proj(v, X0 + i * QX, Y0 + j * QY, hz[j][i]);
    const band = (i: number, j: number) => Math.floor(raw[j][i] * BANDS);
    const cells: [number, number][] = [];
    for (let d = 0; d < NX + NY - 2; d++) for (let j = 0; j < NY - 1; j++) { const i = d - j; if (i >= 0 && i < NX - 1) cells.push([i, j]); }
    for (const [i, j] of cells) {
      const mean = (hz[j][i] + hz[j][i + 1] + hz[j + 1][i] + hz[j + 1][i + 1]) / 4;
      const slope = (hz[j][i + 1] - hz[j][i]) - (hz[j + 1][i] - hz[j][i]) * 0.5;
      const base = mix(mix(pal.bg, pal.border, 0.7), pal.accent, clamp(mean / ZMAX * 1.15));
      poly(g, [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], shade(base, 1 + clamp(slope * 0.18, -0.3, 0.25)), alpha(pal.fg, 0.07));
      const q = [P(i, j), P(i + 1, j), P(i + 1, j + 1)];
      g.strokeStyle = alpha(pal.fg, 0.55); g.lineWidth = 1.4; g.beginPath();
      if (band(i, j) !== band(i + 1, j)) { g.moveTo(q[1][0], q[1][1]); g.lineTo(q[2][0], q[2][1]); }
      if (band(i, j) !== band(i, j + 1)) { const l = P(i, j + 1); g.moveTo(q[2][0], q[2][1]); g.lineTo(l[0], l[1]); }
      g.stroke();
    }
    const fx = proj(v, X0 + front * (NX + 8) * QX - 4 * QX, Y0 - 0.2, 0);
    text(g, `MRR $${(raw[NY >> 1][clamp(Math.round(front * (NX - 1)), 0, NX - 1) | 0] * 480).toFixed(0)}k`, clamp(fx[0], 50, w - 50), clamp(fx[1] + 18, 12, h - 10), pal.fg, 11, "center", "700");
    c.read(`MRR terrain scrubbed to ${Math.round(front * 100)}% of the timeline`);
  };
  return { frame, update() { manual = null; }, key(e) { if (e.key === "ArrowRight") manual = clamp((manual ?? 0.5) + 0.06); if (e.key === "ArrowLeft") manual = clamp((manual ?? 0.5) - 0.06); } };
}
