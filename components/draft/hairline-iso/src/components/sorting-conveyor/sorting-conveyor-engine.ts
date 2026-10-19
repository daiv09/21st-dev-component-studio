import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, line, mix, proj, text, type View } from "../../kit/iso";
import { clamp, damp, lerp, rng } from "../../kit/motion";

/**
 * Sorting Conveyor — packages travel an arc-length-parameterised polyline and diverge at
 * a junction into three lanes by size. `intensity` raises throughput AND moves the size cut-offs,
 * so a different mix lands in each lane.
 */
type Pkg = { d: number; sz: number; lane: number; col: string };
const LANE_Y = [-3.2, 0, 3.2], JX = 1.5, SPEED = 2.4;

export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(7);
  const paths = LANE_Y.map((y) => {
    const pts: [number, number][] = [[-6.5, 0], [JX, 0], [JX, y], [6.5, y]];
    const lens: number[] = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
    return { pts, lens, tot };
  });
  const at = (lane: number, d: number): [number, number] => {
    const p = paths[lane]; let r = d;
    for (let i = 0; i < p.lens.length; i++) {
      if (r <= p.lens[i] || i === p.lens.length - 1) { const u = p.lens[i] ? clamp(r / p.lens[i], 0, 1) : 1; return [lerp(p.pts[i][0], p.pts[i + 1][0], u), lerp(p.pts[i][1], p.pts[i + 1][1], u)]; }
      r -= p.lens[i];
    }
    return p.pts[p.pts.length - 1];
  };
  const pk: Pkg[] = []; const bins = [0, 0, 0]; let spawn = 0, diverter = 0;
  const colors = ["#38bdf8", "#f59e0b", "#a78bfa"];
  const classify = (sz: number, i: number) => (sz < lerp(0.62, 0.78, i) ? 0 : sz < lerp(0.85, 1.0, i) ? 1 : 2);
  const sim = (dt: number) => {
    const i = c.opts().intensity ?? 0.5;
    spawn -= dt;
    if (spawn <= 0) {
      const last = pk.find((p) => p.d < 1.4);
      if (!last) { const sz = 0.45 + rand() * 0.65, lane = classify(sz, i); pk.push({ d: 0, sz, lane, col: colors[lane] }); }
      spawn = (1 / (0.5 + 1.8 * i)) * (0.7 + rand() * 0.6);
    }
    for (let k = pk.length - 1; k >= 0; k--) {
      const p = pk[k]; p.d += SPEED * dt;
      if (Math.abs(p.d - 7.5) < 1.2) diverter = damp(diverter, p.lane === 0 ? -0.95 : p.lane === 2 ? 0.95 : 0, 14, dt);
      if (p.d >= paths[p.lane].tot) { bins[p.lane]++; pk.splice(k, 1); }
    }
  };
  for (let k = 0; k < 400; k++) sim(0.03);

  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal();
    sim(dt);
    const s = Math.min(w / 22.5, h / 12.2);
    const v: View = { s, ox: w / 2 - 1.1 * s, oy: h * 0.5 - 0.3 * s };
    const ln = alpha(pal.fg, 0.35);
    const belt = mix(pal.bg, pal.border, 0.8);
    box(g, v, -6.8, -0.7, 0, 8.9, 1.4, 0.25, belt, ln);
    box(g, v, JX - 0.7, LANE_Y[0] - 0.7, 0, 1.4, 7.8, 0.25, belt, ln);
    for (const y of LANE_Y) box(g, v, JX + 0.7, y - 0.7, 0, 5.4, 1.4, 0.25, belt, ln);
    line(g, proj(v, JX - 1.3, 0, 0.7), proj(v, JX - 1.3 + Math.cos(diverter) * 1.5, Math.sin(diverter) * 1.5, 0.7), pal.accent, 4); // diverter
    LANE_Y.forEach((y, i) => box(g, v, 6.6, y - 0.8, 0, 1.4, 1.6, 0.25 + Math.min(2.6, bins[i] * 0.045), colors[i], ln));
    const sorted = pk.map((p) => ({ p, xy: at(p.lane, p.d) })).sort((a, b) => a.xy[0] + a.xy[1] - b.xy[0] - b.xy[1]);
    for (const { p, xy } of sorted) box(g, v, xy[0] - p.sz / 2, xy[1] - p.sz / 2, 0.25, p.sz, p.sz, p.sz * 0.75, p.col, ln);
    const lbl = ["SMALL", "MEDIUM", "LARGE"];
    LANE_Y.forEach((y, i) => { const [x, yy] = proj(v, 8.6, y + 0.1, 0.3); text(g, lbl[i], x, yy, alpha(pal.fg, 0.6), 10); });
    c.read(`Sorted ${bins[0]} small, ${bins[1]} medium, ${bins[2]} large packages`);
  };
  return { frame };
}
