import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, proj, text, unproj, type View } from "../../kit/iso";
import { clamp, rng, spring, type Spring } from "../../kit/motion";

/**
 * Kanban Isometric Lanes — three platforms (Todo / Doing / Done). Cards ride springs to their slot.
 * Drag a card to another lane and release to drop it. Keys: ↑/↓ select, ←/→ move selected card.
 * Idle: a card advances by itself every few seconds.
 */
type Card = { id: number; col: number; sx: Spring; sy: Spring; z: Spring; color: string; name: string };
const COLX = [-4.6, 0, 4.6], LANES = ["TODO", "DOING", "DONE"];
const slotY = (r: number) => -3.4 + r * 1.75;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(9);
  const names = ["Design", "API", "Docs", "QA", "Deploy", "Review"], colors = ["#f59e0b", "#38bdf8", "#a78bfa", "#34d399", "#fb7185", "#facc15"];
  const cards: Card[] = names.map((n, i) => ({ id: i, col: i < 3 ? 0 : i < 5 ? 1 : 2, sx: { x: 0, v: 0 }, sy: { x: 0, v: 0 }, z: { x: 0, v: 0 }, color: colors[i], name: n }));
  const rows = () => [0, 1, 2].map((col) => cards.filter((k) => k.col === col));
  const place = () => rows().forEach((list, col) => list.forEach((k, r) => { k.sx.x = COLX[col]; k.sy.x = slotY(r); }));
  place();
  let drag: Card | null = null, off = [0, 0], sel = 0, idle = 0, ptrWas = false;
  const reorder = (k: Card, col: number) => { cards.splice(cards.indexOf(k), 1); k.col = clamp(col, 0, 2); cards.push(k); };
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    const s = Math.min(w / 22, h / 12);
    const v: View = { s, ox: w / 2, oy: h * 0.58 };
    const ln = alpha(pal.fg, 0.3);
    if (p.inside) idle = 0; else idle += dt;
    const [wx, wy] = unproj(v, p.px, p.py, 0.4);
    if (p.down && !ptrWas && p.inside) {
      const hit = [...cards].reverse().find((k) => Math.abs(wx - k.sx.x) < 1.5 && Math.abs(wy - k.sy.x) < 0.75);
      if (hit) { drag = hit; off = [hit.sx.x - wx, hit.sy.x - wy]; sel = cards.indexOf(hit); reorder(hit, hit.col); sel = cards.length - 1; }
    }
    if (!p.down && drag) { reorder(drag, Math.round(drag.sx.x / 4.6) + 1); drag = null; }
    ptrWas = p.down;
    if (!p.inside && idle > 2.4 && !drag) { idle = 0; const k = cards[Math.floor(rand() * cards.length)]; reorder(k, (k.col + 1) % 3 === 0 && rand() < 0.5 ? 0 : (k.col + 1) % 3); }
    // targets
    rows().forEach((list, col) => list.forEach((k, r) => {
      const dragging = k === drag;
      const tx = dragging ? wx + off[0] : COLX[col], ty = dragging ? wy + off[1] : slotY(r);
      spring(k.sx, tx, dragging ? 400 : 160, dragging ? 40 : 20, dt); spring(k.sy, ty, dragging ? 400 : 160, dragging ? 40 : 20, dt);
      spring(k.z, dragging ? 0.9 : 0, 220, 24, dt);
    }));
    for (let col = 0; col < 3; col++) {
      box(g, v, COLX[col] - 2, -4.4, -0.3, 4, 9.4, 0.3, mix(pal.bg, pal.border, 0.8), ln);
      const q = proj(v, COLX[col], 5.2, -0.3); text(g, `${LANES[col]} · ${rows()[col].length}`, q[0], q[1] + 8, alpha(pal.fg, 0.7), 11);
    }
    const order = [...cards].sort((a, b) => (a === drag ? 1 : b === drag ? -1 : a.sx.x + a.sy.x - b.sx.x - b.sy.x));
    for (const k of order) {
      const on = cards.indexOf(k) === sel;
      box(g, v, k.sx.x - 1.45, k.sy.x - 0.55, k.z.x, 2.9, 1.1, 0.5, k.color, on ? pal.fg : ln);
      const t = proj(v, k.sx.x, k.sy.x, k.z.x + 0.5); text(g, k.name, t[0], t[1], "#111", 10, "center", "700");
    }
    c.read(`Kanban: ${rows().map((r, i) => `${LANES[i]} ${r.length}`).join(", ")}`);
  };
  return {
    frame,
    key(e) {
      const k = cards[sel]; if (!k) return;
      if (e.key === "ArrowUp") sel = (sel + cards.length - 1) % cards.length;
      if (e.key === "ArrowDown") sel = (sel + 1) % cards.length;
      if (e.key === "ArrowLeft" && k.col > 0) { reorder(k, k.col - 1); sel = cards.length - 1; }
      if (e.key === "ArrowRight" && k.col < 2) { reorder(k, k.col + 1); sel = cards.length - 1; }
    },
  };
}
