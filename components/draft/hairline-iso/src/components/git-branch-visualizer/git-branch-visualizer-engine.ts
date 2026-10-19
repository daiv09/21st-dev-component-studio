import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, dot, line, poly, proj, text, type View } from "../../kit/iso";
import { clamp, damp, lerp, rng } from "../../kit/motion";

/**
 * Git Branch Merge Visualizer — a commit DAG laid out in lanes (main + up to 3 branches).
 * Particles travel parent→child along cubic edges when a commit lands. Merges can raise a conflict node
 * that waits for a click / Enter (auto-resolves after 4 s so the demo keeps flowing).
 * Keys: C commit · B branch · M merge · ↑/↓ choose lane · Enter resolve. Click also resolves / commits.
 */
type Commit = { col: number; lane: number; parents: number[]; born: number; conflict: 0 | 1 | 2 };
type Branch = { lane: number; head: number; base: number; open: boolean };
const LCOL = ["#fafafa", "#38bdf8", "#a78bfa", "#34d399"], DX = 1.7, DY = 2.1;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(31);
  const commits: Commit[] = [{ col: 0, lane: 0, parents: [], born: -9, conflict: 0 }];
  const branches: Branch[] = [{ lane: 0, head: 0, base: 0, open: true }];
  let col = 0, now = 0, nextAct = 0.8, sel = 0, cam = 0, wait = 0, prevDown = false, conflictIdx = -1;
  const add = (lane: number, parents: number[], conflict: 0 | 1 | 2 = 0) => { commits.push({ col: ++col, lane, parents, born: now, conflict }); return commits.length - 1; };
  const commitOn = (b: Branch) => { b.head = add(b.lane, [b.head]); };
  const branchOff = () => {
    const used = new Set(branches.filter((b) => b.open).map((b) => b.lane)); let lane = 1; while (used.has(lane) && lane < 4) lane++;
    if (lane >= 4) return; const src = branches.find((b) => b.open && b.lane === 0)!; const id = add(lane, [src.head]); branches.push({ lane, head: id, base: id, open: true });
  };
  const merge = () => {
    const b = branches.find((x) => x.open && x.lane > 0 && x.head !== x.base) ?? branches.find((x) => x.open && x.lane > 0); if (!b) return;
    const main = branches[0]; const cf = rand() < 0.45 ? 1 : 0;
    const id = add(0, [main.head, b.head], cf as 0 | 1); main.head = id; b.open = false;
    if (cf) { conflictIdx = id; wait = 0; }
  };
  const resolve = () => { if (conflictIdx >= 0) { commits[conflictIdx].conflict = 2; conflictIdx = -1; } };
  const auto = () => {
    const open = branches.filter((b) => b.open && b.lane > 0), r = rand();
    if (open.length === 0) { r < 0.5 ? commitOn(branches[0]) : branchOff(); }
    else if (r < 0.2) commitOn(branches[0]); else if (r < 0.6) commitOn(open[Math.floor(rand() * open.length)]);
    else if (r < 0.75 && open.length < 3) branchOff(); else if (r < 0.9) merge(); else commitOn(branches[0]);
  };
  const edge = (a: Commit, b: Commit, u: number): [number, number] => {
    const ax = a.col * DX, ay = a.lane * DY, bx = b.col * DX, by = b.lane * DY, m = (bx - ax) / 2;
    const t = u, mt = 1 - t; // cubic with horizontal tangents
    return [mt ** 3 * ax + 3 * mt * mt * t * (ax + m) + 3 * mt * t * t * (bx - m) + t ** 3 * bx, mt ** 3 * ay + 3 * mt * mt * t * ay + 3 * mt * t * t * by + t ** 3 * by];
  };
  const frame = (dt: number, t: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer; now += dt;
    if (p.down && !prevDown) { if (conflictIdx >= 0) resolve(); else commitOn(branches.find((b) => b.open && b.lane === sel) ?? branches[0]); } prevDown = p.down;
    if (conflictIdx >= 0) { wait += dt; if (wait > 4) resolve(); } else if ((nextAct -= dt) <= 0) { auto(); nextAct = lerp(1.6, 0.5, c.opts().intensity ?? 0.5); }
    cam = damp(cam, col * DX, 4, dt);
    const s = Math.min(w / 16, h / 9);
    const v: View = { s, ox: w * 0.5 + 2 * s, oy: h * 0.5 };
    const ln = alpha(pal.fg, 0.25);
    const P = (x: number, y: number, z = 0) => proj(v, x - cam + 3, y - 3.2, z);
    for (let l = 0; l < 4; l++) { poly(g, [P(-9, l * DY - 0.5), P(9, l * DY - 0.5), P(9, l * DY + 0.5), P(-9, l * DY + 0.5)], alpha(LCOL[l], 0.07), alpha(LCOL[l], 0.25)); }
    const vis = commits.map((cm, i) => ({ cm, i })).filter(({ cm }) => cm.col * DX - cam > -9 && cm.col * DX - cam < 8);
    g.lineJoin = "round";
    for (const { cm } of vis) for (const pi of cm.parents) {
      const par = commits[pi]; g.strokeStyle = alpha(LCOL[cm.lane === 0 && par.lane !== 0 ? par.lane : Math.max(cm.lane, par.lane) ? Math.max(cm.lane, par.lane) : 0], 0.85); g.lineWidth = 2; g.beginPath();
      for (let k = 0; k <= 16; k++) { const [x, y] = edge(par, cm, k / 16), q = P(x, y, 0.2); k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      const u = (now - cm.born) / 0.7; if (u >= 0 && u < 1) { const [x, y] = edge(par, cm, u), q = P(x, y, 0.3); dot(g, q, 5, alpha(pal.accent, 0.9)); }
    }
    for (const { cm, i } of vis) {
      const [sx, sy] = [cm.col * DX, cm.lane * DY], pop = clamp((now - cm.born) / 0.4), z = 0.55 * pop;
      if (cm.conflict === 1) { const q = P(sx, sy, 0.9 + Math.sin(t * 6) * 0.1); poly(g, [[q[0], q[1] - 11], [q[0] + 9, q[1]], [q[0], q[1] + 11], [q[0] - 9, q[1]]], "#ef4444", pal.fg, 1.5); }
      else { box(g, v, sx - cam + 3 - 0.35, sy - 3.2 - 0.35, 0, 0.7, 0.7, z, cm.conflict === 2 ? "#22c55e" : LCOL[cm.lane], ln); }
      void i;
    }
    const hl = branches.filter((b) => b.open);
    text(g, conflictIdx >= 0 ? "MERGE CONFLICT — click to resolve" : `${commits.length} commits · ${hl.length} open branch${hl.length === 1 ? "" : "es"}`, w / 2, h * 0.92, conflictIdx >= 0 ? "#ef4444" : alpha(pal.fg, 0.6), 11, "center", "700");
    c.read(conflictIdx >= 0 ? "Merge conflict waiting for resolution" : `${commits.length} commits across ${hl.length} open branches`);
    void line;
  };
  return { frame, key(e) {
    const k = e.key.toLowerCase(); const open = branches.filter((b) => b.open);
    if (k === "c") commitOn(open.find((b) => b.lane === sel) ?? branches[0]);
    if (k === "b") branchOff(); if (k === "m") merge();
    if (k === "enter") resolve();
    if (e.key === "ArrowUp") sel = clamp(sel - 1, 0, 3); if (e.key === "ArrowDown") sel = clamp(sel + 1, 0, 3);
  } };
}
