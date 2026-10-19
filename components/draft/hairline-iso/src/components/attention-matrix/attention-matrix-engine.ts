import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, proj, text, type View } from "../../kit/iso";
import { clamp, damp, rng } from "../../kit/motion";

/**
 * Neural Network Activation Matrix — three transformer layers as iso tile rows (one tile per token).
 * Attention weights are softmax(QKᵀ/√d) from seeded vectors (causal mask). Pick a token in the top layer
 * and the weights are rolled out downward: line opacity = product of the weights along the path.
 * Hover a top tile, ←/→ to move, otherwise it tours the tokens.
 */
const TOK = ["The", "cat", "sat", "on", "the", "mat", "."], T = TOK.length, LAY = 3, D = 8;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(71);
  const vec = () => Array.from({ length: D }, () => rand() * 2 - 1);
  const attn = Array.from({ length: LAY }, () => {
    const Q = Array.from({ length: T }, vec), K = Array.from({ length: T }, vec);
    return Q.map((q, i) => {
      const sc = K.map((k, j) => (j > i ? -Infinity : q.reduce((a, x, d) => a + x * k[d], 0) / Math.sqrt(D) * 2.2));
      const m = Math.max(...sc), ex = sc.map((x) => Math.exp(x - m)), z = ex.reduce((a, b) => a + b, 0);
      return ex.map((x) => x / z);
    });
  });
  const lit = Array.from({ length: LAY }, () => new Float32Array(T));
  let sel = 5, manual: number | null = null, autoT = 0;
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    const s = Math.min(w / 19, h / 15);
    const v: View = { s, ox: w / 2, oy: h * 0.76 };
    const X0 = -(T - 1) * 0.9, LZ = 3.4, ln = alpha(pal.fg, 0.25);
    const tile = (l: number, i: number): [number, number] => proj(v, X0 + i * 1.8, 0, l * LZ + 0.2);
    if (p.inside) { let best = s * 1.2; for (let i = 0; i < T; i++) { const q = tile(LAY - 1, i), d = Math.hypot(q[0] - p.px, q[1] - p.py); if (d < best) { best = d; manual = i; } } }
    else if (manual === null) { autoT += dt; sel = Math.floor(autoT / 2.2) % T; }
    const cur = manual ?? sel;
    // rollout weights
    const wt = Array.from({ length: LAY }, () => new Float32Array(T)); wt[LAY - 1][cur] = 1;
    for (let l = LAY - 1; l > 0; l--) for (let i = 0; i < T; i++) if (wt[l][i] > 0) for (let j = 0; j < T; j++) wt[l - 1][j] += wt[l][i] * attn[l][i][j];
    for (let l = 0; l < LAY; l++) for (let i = 0; i < T; i++) lit[l][i] = damp(lit[l][i], clamp(wt[l][i] * (l === LAY - 1 ? 1 : 1.6)), 10, dt);
    // layer slabs
    for (let l = 0; l < LAY; l++) box(g, v, X0 - 1, -0.9, l * LZ, (T - 1) * 1.8 + 2, 1.8, 0.12, alpha(pal.border, 0.6), ln);
    // lines
    g.lineCap = "round";
    for (let l = LAY - 1; l > 0; l--) for (let i = 0; i < T; i++) for (let j = 0; j < T; j++) {
      const wgt = wt[l][i] * attn[l][i][j]; if (wgt < 0.01) continue;
      const a = tile(l, i), b = tile(l - 1, j);
      g.strokeStyle = alpha(pal.accent, clamp(0.12 + wgt * 1.6)); g.lineWidth = 0.6 + wgt * 5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    g.lineCap = "butt";
    for (let l = 0; l < LAY; l++) for (let i = 0; i < T; i++) {
      const k = lit[l][i], q = tile(l, i);
      box(g, v, X0 + i * 1.8 - 0.7, -0.7, l * LZ + 0.12, 1.4, 1.4, 0.18, mix(pal.border, pal.accent, k), i === cur && l === LAY - 1 ? pal.fg : ln);
      text(g, TOK[i], q[0], q[1] - 1, k > 0.5 ? "#111" : alpha(pal.fg, 0.8), Math.max(9, s * 0.62), "center", "700");
    }
    const top = proj(v, 0, 0, LAY * LZ + 0.3);
    text(g, "layer 3", w * 0.06, tile(2, 0)[1] - 2, alpha(pal.fg, 0.4), 9, "left"); text(g, "layer 1", w * 0.06, tile(0, 0)[1] - 2, alpha(pal.fg, 0.4), 9, "left");
    void top;
    c.read(`Attention from token "${TOK[cur]}" in the top layer`);
  };
  return { frame, update() { manual = null; }, key(e) { if (e.key === "ArrowRight") manual = ((manual ?? sel) + 1) % T; if (e.key === "ArrowLeft") manual = ((manual ?? sel) + T - 1) % T; } };
}
