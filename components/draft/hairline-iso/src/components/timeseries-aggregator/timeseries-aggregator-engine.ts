import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, proj, text, unproj, type View } from "../../kit/iso";
import { clamp, damp, rng } from "../../kit/motion";

/**
 * Timescale Aggregator — raw ticks land in 0.8 s buckets (front row); every 6 finished buckets are
 * rolled up into one continuous-aggregate column (back row). Hover a column to read its bucket.
 */
type B = { sum: number; n: number; h: number };
const NF = 24, NC = 8, ROLL = 6, BUCKET = 0.8;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(5);
  const fine: B[] = Array.from({ length: NF }, () => ({ sum: 0, n: 0, h: 0 }));
  const coarse: B[] = Array.from({ length: NC }, () => ({ sum: 0, n: 0, h: 0 }));
  let tickAcc = 0, bucketAcc = 0, rolled = 0, tt = 0, hot: { row: number; i: number } | null = null;
  const val = (t: number, k: number) => clamp(0.5 + 0.28 * Math.sin(t * 0.8) + 0.1 * Math.sin(t * 3.1) + (rand() - 0.5) * (0.12 + 0.2 * k));
  const avg = (b: B) => (b.n ? b.sum / b.n : 0);
  const sim = (dt: number) => {
    const k = c.opts().intensity ?? 0.5; tt += dt;
    tickAcc += dt; bucketAcc += dt;
    while (tickAcc > 0.08) { tickAcc -= 0.08; const b = fine[NF - 1]; b.sum += val(tt, k); b.n++; }
    while (bucketAcc > BUCKET) {
      bucketAcc -= BUCKET;
      const done = fine[NF - 1], cb = coarse[NC - 1];
      cb.sum += avg(done); cb.n++; rolled++;
      if (rolled % ROLL === 0) { coarse.shift(); coarse.push({ sum: 0, n: 0, h: 0 }); }
      fine.shift(); fine.push({ sum: 0, n: 0, h: 0 });
    }
  };
  for (let i = 0; i < 700; i++) sim(0.05);
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    sim(dt);
    const s = Math.min(w / 21, h / 11.5);
    const v: View = { s, ox: w / 2, oy: h * 0.68 };
    const ln = alpha(pal.fg, 0.3), HS = 4.2;
    const FW = 0.5, CW = 12 / NC;
    hot = null;
    if (p.inside) {
      const [wx, wy] = unproj(v, p.px, p.py, 0);
      if (wy > -2.6 && wy < -0.6) { const i = Math.floor((wx + 6) / FW); if (i >= 0 && i < NF) hot = { row: 0, i }; }
      else if (wy > 0.8 && wy < 3.2) { const i = Math.floor((wx + 6) / CW); if (i >= 0 && i < NC) hot = { row: 1, i }; }
    }
    box(g, v, -6.4, -3, -0.2, 12.8, 7, 0.2, mix(pal.bg, pal.border, 0.7), ln);
    // back row (coarse): draw first
    for (let i = 0; i < NC; i++) {
      const b = coarse[i], cur = i === NC - 1;
      b.h = damp(b.h, avg(b) * HS, 8, dt);
      const on = hot?.row === 1 && hot.i === i;
      box(g, v, -6 + i * CW + 0.1, 1, 0, CW - 0.2, 2, Math.max(0.05, b.h), on ? pal.fg : pal.accent, ln);
      if (cur) box(g, v, -6 + i * CW + 0.1, 1, b.h, CW - 0.2, 2, 0.05, pal.fg, ln);
    }
    for (let i = 0; i < NF; i++) {
      const b = fine[i], cur = i === NF - 1;
      b.h = damp(b.h, avg(b) * HS, 12, dt);
      const on = hot?.row === 0 && hot.i === i;
      box(g, v, -6 + i * FW + 0.06, -2.4, 0, FW - 0.12, 1.6, Math.max(0.04, b.h), on ? pal.fg : cur ? pal.fg : mix(pal.accent, pal.border, 0.35), ln);
    }
    const a = proj(v, -6, -3.4, 0), b2 = proj(v, -6, 3.6, 0);
    text(g, "RAW 0.8s", a[0] - 4, a[1] + 10, alpha(pal.fg, 0.55), 10, "left");
    text(g, "ROLLUP 4.8s", b2[0] - 4, b2[1] + 10, alpha(pal.fg, 0.55), 10, "left");
    const msg = hot ? `${hot.row ? "Rollup" : "Raw"} bucket ${hot.i + 1}: avg ${avg((hot.row ? coarse : fine)[hot.i]).toFixed(2)}` : `Latest raw avg ${avg(fine[NF - 2]).toFixed(2)}, ${rolled} buckets rolled up`;
    c.read(msg);
    if (hot) { const bb = (hot.row ? coarse : fine)[hot.i]; const q = proj(v, -6 + (hot.row ? (hot.i + 0.5) * CW : (hot.i + 0.5) * FW), hot.row ? 2 : -1.6, bb.h + 0.8); text(g, avg(bb).toFixed(2), q[0], q[1], pal.fg, 12, "center", "700"); }
  };
  return { frame };
}
