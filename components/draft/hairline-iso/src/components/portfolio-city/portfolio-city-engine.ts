import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, proj, text, type View } from "../../kit/iso";
import { damp } from "../../kit/motion";

/**
 * Portfolio Allocation City — each asset is a tower. Footprint ∝ √weight; floor count ∝ Sharpe
 * (return ÷ volatility); floor colour shifts toward the accent as volatility rises.
 * Returns random-walk slowly so the skyline breathes. Hover a tower to read its numbers.
 */
const A = [
  { n: "AAPL", w: 0.18, r: 0.22, v: 0.24 }, { n: "BND", w: 0.2, r: 0.045, v: 0.05 }, { n: "VTI", w: 0.15, r: 0.1, v: 0.15 },
  { n: "GLD", w: 0.08, r: 0.07, v: 0.14 }, { n: "BTC", w: 0.05, r: 0.55, v: 0.7 }, { n: "NVDA", w: 0.1, r: 0.45, v: 0.5 },
  { n: "REIT", w: 0.12, r: 0.06, v: 0.16 }, { n: "CASH", w: 0.12, r: 0.04, v: 0.01 },
];
export function mount(c: EngineCtx): EngineInstance {
  const hs = A.map(() => 0); let hover = -1, autoT = 0, tt = 0;
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer; tt += dt * (0.3 + (c.opts().intensity ?? 0.5));
    const s = Math.min(w / 19, h / 12.5);
    const v: View = { s, ox: w / 2, oy: h * 0.66 };
    const pos = (i: number): [number, number] => [(i % 4) * 3.4 - 5.1, Math.floor(i / 4) * 3.6 - 1.8];
    const sharpe = (i: number) => Math.max(0.1, (A[i].r * (1 + 0.25 * Math.sin(tt + i * 1.3))) / (A[i].v + 0.01));
    if (p.inside) { hover = -1; let best = s * 1.7; A.forEach((_, i) => { const [x, y] = pos(i), hh = Math.min(7, 1 + sharpe(i) * 1.3) * 0.5; const q = proj(v, x, y, hh); const d = Math.hypot(q[0] - p.px, q[1] - p.py); if (d < best) { best = d; hover = i; } }); autoT = 0; }
    else { autoT += dt; hover = Math.floor(autoT / 2.2) % A.length; }
    box(g, v, -6.8, -3.4, -0.3, 13.6, 7.6, 0.3, mix(pal.bg, pal.border, 0.8), alpha(pal.fg, 0.2));
    const order = A.map((_, i) => i).sort((a, b) => { const [ax, ay] = pos(a), [bx, by] = pos(b); return ax + ay - bx - by; });
    for (const i of order) {
      const [x, y] = pos(i), a = A[i], fw = 1.0 + Math.sqrt(a.w) * 3.4, floors = Math.min(14, 2 + sharpe(i) * 2.6);
      hs[i] = damp(hs[i], floors, 5, dt);
      const col = mix(pal.border, pal.accent, Math.min(1, a.v * 1.3)), on = i === hover, n = Math.ceil(hs[i]);
      for (let f = 0; f < n; f++) { const fh = 0.5 * Math.min(1, hs[i] - f); box(g, v, x - fw / 2, y - fw / 2, f * 0.5, fw, fw, Math.max(0.05, fh - 0.04), on ? mix(col, pal.fg, 0.35) : col, alpha(pal.fg, 0.28)); }
    }
    for (const i of order) { const [x, y] = pos(i); const q = proj(v, x, y + 1.4, 0); text(g, A[i].n, q[0], q[1] + 8, i === hover ? pal.fg : alpha(pal.fg, 0.55), 10, "center", i === hover ? "700" : "500"); }
    if (hover >= 0) {
      const a = A[hover], [x, y] = pos(hover), q = proj(v, x, y, hs[hover] * 0.5 + 0.8);
      const txt = `${a.n}  ${(a.w * 100).toFixed(0)}%  Sharpe ${sharpe(hover).toFixed(1)}`;
      g.font = "600 11px ui-monospace, monospace"; const tw = g.measureText(txt).width + 16;
      g.fillStyle = alpha(pal.bg, 0.92); g.strokeStyle = alpha(pal.fg, 0.4); g.lineWidth = 1; g.beginPath(); g.roundRect(q[0] - tw / 2, q[1] - 24, tw, 20, 5); g.fill(); g.stroke();
      text(g, txt, q[0], q[1] - 14, pal.fg, 11, "center", "600");
      c.read(`${a.n}: ${(a.w * 100).toFixed(0)}% of portfolio, Sharpe ratio ${sharpe(hover).toFixed(1)}, volatility ${(a.v * 100).toFixed(0)}%`);
    }
  };
  return { frame };
}
