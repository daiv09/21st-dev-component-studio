import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, dot, line, mix, proj, text, type View } from "../../kit/iso";
import { lerp, rng } from "../../kit/motion";

/**
 * Microservice Cluster Mesh — 4×3 rack grid linked by fibre conduits.
 * Packets are (edge, t) pairs; hovering a node lights its edges and biases traffic toward them.
 */
const COLS = 4, ROWS = 3, GAP = 3.1;
type Pk = { e: number; t: number; dir: 1 | -1; sp: number };
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(11);
  const names = ["gw", "auth", "api", "db", "cache", "queue", "ml", "search", "mail", "ws", "cdn", "log"];
  const nodes = Array.from({ length: COLS * ROWS }, (_, i) => ({
    x: ((i % COLS) - (COLS - 1) / 2) * GAP, y: (Math.floor(i / COLS) - (ROWS - 1) / 2) * GAP, h: 0.9 + ((i * 7) % 3) * 0.55, name: names[i],
  }));
  const edges: [number, number][] = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const a = j * COLS + i;
    if (i < COLS - 1) edges.push([a, a + 1]);
    if (j < ROWS - 1) edges.push([a, a + COLS]);
    if (i < COLS - 1 && j < ROWS - 1 && (i + j) % 2 === 0) edges.push([a, a + COLS + 1]);
  }
  const pk: Pk[] = []; let acc = 0, hover = -1, autoT = 0;
  for (let i = 0; i < 24; i++) pk.push({ e: i % edges.length, t: rand(), dir: 1, sp: 0.6 });
  const frame = (dt: number, t: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    const s = Math.min(w / 17, h / 12.5);
    const v: View = { s, ox: w / 2, oy: h * 0.5 + 0.8 * s };
    const ln = alpha(pal.fg, 0.35);
    if (p.inside) {
      hover = -1; let best = s * 1.6;
      nodes.forEach((n, i) => { const [x, y] = proj(v, n.x, n.y, n.h / 2); const d = Math.hypot(x - p.px, y - p.py); if (d < best) { best = d; hover = i; } });
    } else { autoT += dt; hover = Math.floor(autoT / 2.5) % nodes.length; }
    const inten = c.opts().intensity ?? 0.5;
    acc += dt * (3 + 12 * inten);
    while (acc > 1) {
      acc--;
      const hot = hover >= 0 ? edges.map((e, i) => (e[0] === hover || e[1] === hover ? i : -1)).filter((i) => i >= 0) : [];
      const e = hot.length && rand() < 0.55 ? hot[Math.floor(rand() * hot.length)] : Math.floor(rand() * edges.length);
      pk.push({ e, t: 0, dir: rand() < 0.5 ? 1 : -1, sp: 0.5 + rand() * 0.7 });
    }
    for (let i = pk.length - 1; i >= 0; i--) { pk[i].t += dt * pk[i].sp; if (pk[i].t >= 1) pk.splice(i, 1); }

    edges.forEach(([a, b]) => {
      const hot = hover >= 0 && (a === hover || b === hover);
      line(g, proj(v, nodes[a].x, nodes[a].y, 0.08), proj(v, nodes[b].x, nodes[b].y, 0.08), hot ? pal.accent : mix(pal.bg, pal.border, 0.9), hot ? 2.5 : 1.5);
    });
    g.globalCompositeOperation = pal.dark ? "lighter" : "source-over";
    for (const q of pk) {
      const [a, b] = edges[q.e], u = q.dir === 1 ? q.t : 1 - q.t;
      const [sx, sy] = proj(v, lerp(nodes[a].x, nodes[b].x, u), lerp(nodes[a].y, nodes[b].y, u), 0.16);
      const hot = hover >= 0 && (a === hover || b === hover);
      g.fillStyle = alpha(pal.accent, hot ? 0.35 : 0.2); g.beginPath(); g.arc(sx, sy, s * 0.3, 0, 7); g.fill();
      dot(g, [sx, sy], Math.max(2, s * 0.1), hot ? pal.fg : pal.accent);
    }
    g.globalCompositeOperation = "source-over";
    const order = nodes.map((_, i) => i).sort((a, b) => nodes[a].x + nodes[a].y - nodes[b].x - nodes[b].y);
    for (const i of order) {
      const n = nodes[i], on = i === hover;
      box(g, v, n.x - 0.8, n.y - 0.8, 0, 1.6, 1.6, n.h, on ? mix(pal.border, pal.accent, 0.5) : pal.border, ln);
      const led = proj(v, n.x, n.y + 0.82, n.h * 0.7);
      for (let k = 0; k < 3; k++) dot(g, [led[0] + (k - 1) * s * 0.35 - s * 0.35, led[1]], 2, Math.sin(t * (2 + k) + i * 1.7) > 0 ? pal.accent : alpha(pal.fg, 0.3));
      if (on) { const tp = proj(v, n.x, n.y, n.h + 0.5); text(g, n.name, tp[0], tp[1], pal.fg, 11); }
    }
    c.read(hover >= 0 ? `Service ${nodes[hover].name} highlighted` : "Service mesh idle");
  };
  return { frame };
}
