import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, dot, mix, proj, text, type View } from "../../kit/iso";
import { clamp, lerp, rng } from "../../kit/motion";
import { fbm, noise2 } from "../../kit/noise";

/**
 * Transaction Routing Mesh — nine regional gateways on a stylised iso map. Payment packets arc along
 * links (latency ∝ distance → speed). Arrival spawns a ripple: green = settled, red = failed.
 * Hover a gateway to light its links; click to take it down / bring it back.
 */
const GW = [
  { n: "SFO", x: -6.2, y: -1.2 }, { n: "IAD", x: -3.8, y: -0.4 }, { n: "GRU", x: -3.4, y: 3.2 },
  { n: "LHR", x: -0.6, y: -2.2 }, { n: "FRA", x: 0.9, y: -1.2 }, { n: "DXB", x: 2.8, y: 0.2 },
  { n: "BOM", x: 4.4, y: 1.0 }, { n: "SIN", x: 5.6, y: 2.8 }, { n: "NRT", x: 6.6, y: -1.0 },
];
type Pk = { a: number; b: number; u: number; sp: number };
type Rp = { x: number; y: number; u: number; ok: boolean };
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(51), nz = noise2(5);
  const links: [number, number][] = [];
  GW.forEach((a, i) => GW.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) })).filter((o) => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 3).forEach((o) => { if (!links.some(([x, y]) => (x === i && y === o.j) || (x === o.j && y === i))) links.push([i, o.j]); }));
  const land: [number, number][] = [];
  for (let x = -8; x <= 8; x += 0.5) for (let y = -4.5; y <= 4.5; y += 0.5) if (fbm(nz, x * 0.28 + 3, y * 0.28 + 3, 3) + 0.1 > 0.52 || GW.some((q) => Math.hypot(q.x - x, q.y - y) < 1.1)) land.push([x, y]);
  const down = GW.map(() => false), pk: Pk[] = [], rp: Rp[] = [];
  let acc = 0, ok = 0, bad = 0, hover = -1, prevDown = false, tt = 0, autoT = 0, lat = 80;
  const sim = (dt: number) => {
    const inten = c.opts().intensity ?? 0.5;
    acc += dt * (2 + 9 * inten);
    while (acc > 1) { acc--; const [a, b] = links[Math.floor(rand() * links.length)], f = rand() < 0.5; const [aa, bb] = f ? [a, b] : [b, a]; pk.push({ a: aa, b: bb, u: 0, sp: 1.6 / Math.hypot(GW[aa].x - GW[bb].x, GW[aa].y - GW[bb].y) }); }
    for (let i = pk.length - 1; i >= 0; i--) {
      const q = pk[i]; q.u += dt * q.sp * 1.4;
      if (q.u >= 1) { const good = !down[q.b] && rand() > 0.03; good ? ok++ : bad++; lat = lerp(lat, 40 + Math.hypot(GW[q.a].x - GW[q.b].x, GW[q.a].y - GW[q.b].y) * 28, 0.05); rp.push({ x: GW[q.b].x, y: GW[q.b].y, u: 0, ok: good }); pk.splice(i, 1); }
    }
    for (let i = rp.length - 1; i >= 0; i--) { rp[i].u += dt * 1.1; if (rp[i].u >= 1) rp.splice(i, 1); }
  };
  for (let i = 0; i < 80; i++) sim(0.05);
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer; tt += dt;
    sim(dt);
    const s = Math.min(w / 16.5, h / 9);
    const v: View = { s, ox: w / 2, oy: h * 0.58 };
    if (p.inside) { hover = -1; let best = s * 1.4; GW.forEach((q, i) => { const [x, y] = proj(v, q.x, q.y, 0.4); const d = Math.hypot(x - p.px, y - p.py); if (d < best) { best = d; hover = i; } }); if (p.down && !prevDown && hover >= 0) down[hover] = !down[hover]; autoT = 0; }
    else { autoT += dt; hover = Math.floor(autoT / 2.4) % GW.length; if (Math.floor(autoT / 2.4) !== Math.floor((autoT - dt) / 2.4) && rand() < 0.4) down[hover] = !down[hover]; }
    prevDown = p.down;
    for (const [x, y] of land) { const q = proj(v, x, y, 0); g.fillStyle = alpha(pal.fg, 0.16); g.fillRect(q[0] - 1.2, q[1] - 1.2, 2.4, 2.4); }
    const arc = (a: number, b: number, u: number): [number, number] => { const A = GW[a], B = GW[b], d = Math.hypot(A.x - B.x, A.y - B.y); return proj(v, lerp(A.x, B.x, u), lerp(A.y, B.y, u), 0.3 + Math.sin(u * Math.PI) * d * 0.28); };
    for (const [a, b] of links) {
      const hot = hover >= 0 && (a === hover || b === hover), dead = down[a] || down[b];
      g.strokeStyle = dead ? alpha("#ef4444", 0.35) : hot ? pal.accent : alpha(pal.fg, 0.2); g.lineWidth = hot ? 2 : 1; g.beginPath();
      for (let k = 0; k <= 20; k++) { const q = arc(a, b, k / 20); k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
    }
    for (const r of rp) { g.strokeStyle = alpha(r.ok ? "#22c55e" : "#ef4444", (1 - r.u) * 0.9); g.lineWidth = 1.5; g.beginPath(); for (let k = 0; k <= 24; k++) { const a = (k / 24) * Math.PI * 2, q = proj(v, r.x + Math.cos(a) * r.u * 1.7, r.y + Math.sin(a) * r.u * 1.7, 0.1); k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke(); }
    g.globalCompositeOperation = pal.dark ? "lighter" : "source-over";
    for (const q of pk) { const [x, y] = arc(q.a, q.b, q.u); dot(g, [x, y], 5, alpha(pal.accent, 0.3)); dot(g, [x, y], 2.2, pal.accent); }
    g.globalCompositeOperation = "source-over";
    const order = GW.map((_, i) => i).sort((a, b) => GW[a].x + GW[a].y - GW[b].x - GW[b].y);
    for (const i of order) {
      const q = GW[i]; box(g, v, q.x - 0.35, q.y - 0.35, 0, 0.7, 0.7, 0.5, down[i] ? "#ef4444" : i === hover ? pal.accent : mix(pal.border, pal.fg, 0.4), alpha(pal.fg, 0.4));
      const tp = proj(v, q.x, q.y, 0.9); text(g, q.n, tp[0], tp[1] - 4, i === hover ? pal.fg : alpha(pal.fg, 0.65), 10, "center", i === hover ? "700" : "500");
    }
    const tot = ok + bad;
    text(g, `${tot ? ((ok / tot) * 100).toFixed(1) : "100"}% settled  ·  ${Math.round(lat)} ms`, w / 2, h - 14, alpha(pal.fg, 0.6), 11);
    c.read(`${tot ? Math.round((ok / tot) * 100) : 100}% of payments settled, ${down.filter(Boolean).length} gateways down`);
    void clamp;
  };
  return { frame };
}
