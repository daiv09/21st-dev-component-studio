import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, dot, grid, line, mix, proj, text, type View } from "../../kit/iso";
import { clamp, rng } from "../../kit/motion";

/**
 * Vector Embedding Space — 5 Gaussian clusters of 8-D vectors, first 3 dims are the plotted position.
 * Hover a point → its 5 nearest neighbours by cosine similarity (over all 8 dims) are joined by arcs.
 * Drag horizontally to rotate. Idle: auto-tours the points.
 */
const D = 8, K = 5;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(21);
  const gauss = () => (rand() + rand() + rand() - 1.5) * 1.15;
  const centers = Array.from({ length: K }, () => Array.from({ length: D }, () => (rand() - 0.5) * 6));
  const hues = ["#f59e0b", "#38bdf8", "#a78bfa", "#34d399", "#fb7185"];
  const pts = Array.from({ length: K * 22 }, (_, i) => { const k = Math.floor(i / 22); return { k, v: centers[k].map((m) => m + gauss() * 0.7) }; });
  const cos = (a: number[], b: number[]) => { let d = 0, na = 0, nb = 0; for (let i = 0; i < D; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return d / Math.sqrt(na * nb); };
  let yaw = 0.6, autoT = 0, lastX = 0, dragging = false;
  const frame = (dt: number, t: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    if (p.down) { if (dragging) yaw += (p.px - lastX) * 0.012; dragging = true; lastX = p.px; } else { dragging = false; yaw += dt * 0.12; }
    const s = Math.min(w / 10, h / 8);
    const v: View = { s, ox: w / 2, oy: h * 0.55 };
    grid(g, v, -5, 5, -5, 5, 2.5, alpha(pal.fg, 0.1), -3.2);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const sc = pts.map((q) => { const x = q.v[0] * cy - q.v[1] * sy, y = q.v[0] * sy + q.v[1] * cy, z = q.v[2]; return { x, y, z, s: proj(v, x * 0.9, y * 0.9, z * 0.9) }; });
    // hover
    let hov = -1;
    if (p.inside) { let best = 22; sc.forEach((q, i) => { const d = Math.hypot(q.s[0] - p.px, q.s[1] - p.py); if (d < best) { best = d; hov = i; } }); }
    else { autoT += dt; hov = Math.floor(autoT / 2.2 * 1) % pts.length; hov = (hov * 7) % pts.length; }
    const order = sc.map((_, i) => i).sort((a, b) => sc[a].x + sc[a].y + sc[a].z * 0.01 - (sc[b].x + sc[b].y + sc[b].z * 0.01));
    const nn = hov >= 0 ? pts.map((q, i) => ({ i, sim: i === hov ? -2 : cos(pts[hov].v, q.v) })).sort((a, b) => b.sim - a.sim).slice(0, 5) : [];
    const near = new Set(nn.map((n) => n.i));
    for (const i of order) {
      const q = sc[i], hl = i === hov, isN = near.has(i);
      const r = (hl ? 6 : isN ? 5 : 3.2) + (q.x + q.y) * 0.12;
      g.globalAlpha = hov >= 0 && !hl && !isN ? 0.45 : 1;
      dot(g, q.s, Math.max(2, r), hues[pts[i].k]);
      if (hl) { g.strokeStyle = pal.fg; g.lineWidth = 2; g.beginPath(); g.arc(q.s[0], q.s[1], r + 4, 0, 7); g.stroke(); }
    }
    g.globalAlpha = 1;
    if (hov >= 0) {
      for (const n of nn) {
        const a = sc[hov].s, b = sc[n.i].s, mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - Math.hypot(a[0] - b[0], a[1] - b[1]) * 0.35];
        g.strokeStyle = alpha(pal.fg, clamp(0.25 + n.sim * 0.7)); g.lineWidth = 1 + Math.max(0, n.sim) * 2;
        g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mid[0], mid[1], b[0], b[1]); g.stroke();
        text(g, n.sim.toFixed(2), mid[0], mid[1] - 6, alpha(pal.fg, 0.8), 10);
      }
      c.read(`Point in cluster ${pts[hov].k + 1}; nearest neighbour similarity ${nn[0].sim.toFixed(2)}`);
    }
    void t; void line; void mix;
  };
  return { frame };
}
