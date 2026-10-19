import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, text, proj, type View } from "../../kit/iso";
import { clamp, damp, lerp, rng } from "../../kit/motion";

/**
 * Kubernetes Pod Orchestrator — 3 nodes × 6 pod slots.
 * Pod FSM: pending → running → throttled → crashloop (exponential backoff) → pending.
 * A synthetic load drives CPU; an HPA loop (1 s) adds/removes replicas to hold ~60 % CPU.
 * Press / click to spike the load.
 */
type Pod = { st: 0 | 1 | 2 | 3 | 4; node: number; slot: number; timer: number; cpu: number; hd: number; backoff: number };
const NODES = 3, SLOTS = 6, COL = ["", "#64748b", "#22c55e", "#f97316", "#ef4444"];
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(3);
  const pods: Pod[] = [];
  const heat = [0, 0, 0]; let hpa = 0, tt = 0, load = 0, spike = 0, restarts = 0;
  const free = (n: number) => { for (let s = 0; s < SLOTS; s++) if (!pods.some((p) => p.node === n && p.slot === s)) return s; return -1; };
  const addPod = () => {
    const order = [0, 1, 2].sort((a, b) => pods.filter((p) => p.node === a).length - pods.filter((p) => p.node === b).length);
    for (const n of order) { const s = free(n); if (s >= 0) { pods.push({ st: 1, node: n, slot: s, timer: 0.8, cpu: 0, hd: 0, backoff: 1 }); return; } }
  };
  for (let i = 0; i < 5; i++) { addPod(); pods[i].st = 2; pods[i].timer = 0; }
  const sim = (dt: number) => {
    tt += dt; spike = damp(spike, c.pointer.down ? 0.4 : 0, 2, dt);
    load = (0.1 + 0.9 * clamp((c.opts().intensity ?? 0.5) * 0.8 + 0.2 * Math.sin(tt * 0.3) + spike)) * 14;
    const active = pods.filter((p) => p.st === 2 || p.st === 3);
    const cpu = load / Math.max(1, active.length);
    for (const p of pods) {
      p.timer -= dt;
      if (p.st === 1 && p.timer <= 0) p.st = 2;
      if (p.st === 2 || p.st === 3) { p.cpu = damp(p.cpu, clamp(cpu * (0.85 + 0.3 * rand())), 3, dt); p.st = p.cpu > 0.88 ? 3 : 2; if (p.st === 3 && rand() < 0.06 * dt * 10) { p.st = 4; p.timer = 1.2 * p.backoff; p.backoff = Math.min(8, p.backoff * 2); p.cpu = 0; restarts++; } }
      if (p.st === 4) { p.cpu = 0; if (p.timer <= 0) { p.st = 1; p.timer = 0.8; } }
      if (p.st === 2 && p.cpu < 0.5) p.backoff = Math.max(1, p.backoff * (1 - dt * 0.2));
    }
    hpa += dt;
    if (hpa >= 1) {
      hpa = 0; const n = active.length || 1, want = clamp(Math.ceil(n * (load / n) / 0.6), 2, NODES * SLOTS);
      if (want > pods.length) addPod(); else if (want < pods.length - 1) { const i = pods.findIndex((p) => p.st === 2); if (i >= 0) pods.splice(i, 1); }
    }
    for (let n = 0; n < NODES; n++) { const ps = pods.filter((p) => p.node === n); heat[n] = damp(heat[n], ps.length ? ps.reduce((a, p) => a + p.cpu, 0) / SLOTS : 0, 2, dt); }
  };
  for (let i = 0; i < 160; i++) sim(0.05);
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal();
    sim(dt);
    const s = Math.min(w / 19, h / 11);
    const v: View = { s, ox: w / 2, oy: h * 0.6 };
    const ln = alpha(pal.fg, 0.3);
    for (let n = 0; n < NODES; n++) {
      const x0 = (n - 1) * 5 - 1.9;
      box(g, v, x0 - 0.3, -2, -0.4, 4.2, 4, 0.4, mix(pal.border, "#ef4444", clamp(heat[n] - 0.5) * 1.2), ln);
      const mine = pods.filter((p) => p.node === n).sort((a, b) => (a.slot % 3) + Math.floor(a.slot / 3) - ((b.slot % 3) + Math.floor(b.slot / 3)));
      for (const p of mine) {
        p.hd = damp(p.hd, p.st === 4 ? 0.2 : p.st === 1 ? 0.35 : 0.5 + p.cpu * 1.3, 8, dt);
        const px = x0 + (p.slot % 3) * 1.3, py = -1.4 + Math.floor(p.slot / 3) * 1.7 + 0.2;
        box(g, v, px, py, 0, 1.0, 1.0, p.hd, p.st === 1 ? pal.border : COL[p.st], ln);
      }
      const q = proj(v, x0 + 1.5, 2.6, 0); text(g, `node-${n + 1}`, q[0], q[1] + 8, alpha(pal.fg, 0.6), 10);
    }
    const run = pods.filter((p) => p.st === 2).length, thr = pods.filter((p) => p.st === 3).length, cr = pods.filter((p) => p.st === 4).length;
    c.read(`${pods.length} pods: ${run} running, ${thr} throttled, ${cr} restarting. ${restarts} restarts so far.`);
    text(g, `pods ${pods.length}  ·  load ${Math.round(load / 14 * 100)}%  ·  restarts ${restarts}`, w / 2, h - 14, alpha(pal.fg, 0.6), 11);
    void lerp;
  };
  return { frame };
}
