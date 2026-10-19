import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, line, proj, text, type View } from "../../kit/iso";
import { clamp, damp, rng } from "../../kit/motion";

/**
 * Order Book Depth Wall — 40 price levels. Back row = cumulative depth (the mountain range),
 * front row = resting size per level. Pointer X moves the mid price (bids ← → asks).
 * Random order flow spikes levels; everything eases to its target.
 */
const N = 40, CW = 0.3;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(41);
  const size = new Float32Array(N).fill(0.4), target = new Float32Array(N).fill(0.4), spike = new Float32Array(N);
  const hCum = new Float32Array(N), hSz = new Float32Array(N);
  let mid = 20, scale = 1, acc = 0, tt = 0;
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    tt += dt;
    const k = c.opts().intensity ?? 0.5;
    const wantMid = p.inside ? clamp(p.x, 0.15, 0.85) * N : 20 + Math.sin(tt * 0.35) * 7;
    mid = damp(mid, wantMid, 4, dt);
    acc += dt * (4 + 22 * k);
    while (acc > 1) { acc--; const i = Math.floor(rand() * N); spike[i] += 0.5 + rand() * 0.9; }
    const nb = Math.round(mid);
    for (let i = 0; i < N; i++) {
      const dist = Math.abs(i - mid);
      target[i] = (0.22 + 0.28 * (0.5 + 0.5 * Math.sin(i * 1.9 + tt * (0.5 + (i % 5) * 0.12)))) * (0.6 + dist * 0.045) + spike[i];
      spike[i] = damp(spike[i], 0, 1.8, dt);
      size[i] = damp(size[i], target[i], 6, dt);
    }
    // cumulative from mid outward
    const cum = new Float32Array(N); let sb = 0, sa = 0;
    for (let i = nb - 1; i >= 0; i--) { sb += size[i]; cum[i] = sb; }
    for (let i = nb; i < N; i++) { sa += size[i]; cum[i] = sa; }
    scale = damp(scale, 5.2 / Math.max(2, Math.max(sb, sa)), 2, dt);
    const s = Math.min(w / 17.5, h / 13.5);
    const v: View = { s, ox: w / 2, oy: h * 0.62 };
    const ln = alpha(pal.fg, 0.2), X0 = -N * CW / 2;
    box(g, v, X0 - 0.4, -1.8, -0.2, N * CW + 0.8, 4.2, 0.2, alpha(pal.border, 0.5), ln);
    for (let i = 0; i < N; i++) {
      hCum[i] = damp(hCum[i], cum[i] * scale, 10, dt); hSz[i] = damp(hSz[i], size[i] * scale * 1.8, 12, dt);
      const bid = i < nb, col = bid ? "#22c55e" : "#ef4444";
      box(g, v, X0 + i * CW, 0.1, 0, CW - 0.03, 1.5, Math.max(0.03, hCum[i]), col, ln);
    }
    for (let i = 0; i < N; i++) {
      const bid = i < nb;
      box(g, v, X0 + i * CW + 0.02, -1.5, 0, CW - 0.07, 1.1, Math.max(0.03, hSz[i]), bid ? "#16a34a" : "#dc2626", ln, { t: 1.3, l: 0.85, r: 0.65 });
    }
    const m = proj(v, X0 + nb * CW, -1.9, 0), m2 = proj(v, X0 + nb * CW, 1.8, 0);
    line(g, m, m2, alpha(pal.fg, 0.6), 1);
    text(g, "MID", m[0], m[1] + 12, pal.fg, 11, "center", "700");
    text(g, "BIDS", proj(v, X0 + 2, -1.9, 0)[0], proj(v, X0 + 2, -1.9, 0)[1] + 12, "#22c55e", 10);
    text(g, "ASKS", proj(v, X0 + N * CW - 2, -1.9, 0)[0], proj(v, X0 + N * CW - 2, -1.9, 0)[1] + 12, "#ef4444", 10);
    c.read(`Order book: ${nb} bid levels, ${N - nb} ask levels, bid depth ${sb.toFixed(1)}, ask depth ${sa.toFixed(1)}`);
  };
  return { frame };
}
