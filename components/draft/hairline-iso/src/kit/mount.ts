/**
 * kit/mount.ts — the single-mount engine host.
 * `create(spec, el, options)` fills one empty element with a canvas, runs one rAF loop,
 * and returns { update, destroy }. Engines only implement `frame(dt, t)`.
 */
export type HairlineOptions = {
  intensity?: number;                    // 0..1, meaning is per-figure
  theme?: "light" | "dark" | "auto";
  label?: string;                        // accessible name
  onRead?: (text: string) => void;       // live text description of the current state
};
export type Figure = { update(o: HairlineOptions): void; destroy(): void };
export type Palette = { bg: string; fg: string; border: string; accent: string; dark: boolean };
export type Pointer = { x: number; y: number; px: number; py: number; down: boolean; inside: boolean }; // x,y: 0..1 · px,py: CSS px
export type EngineCtx = {
  g: CanvasRenderingContext2D; w: number; h: number; dpr: number;
  pal: () => Palette; opts: () => HairlineOptions; pointer: Pointer;
  reduced: () => boolean; read: (t: string) => void; invalidate: () => void;
};
export type EngineInstance = {
  frame(dt: number, t: number): void;    // dt seconds (0 under reduced motion), t absolute seconds
  resize?(): void; update?(): void;
  key?(e: KeyboardEvent): void; destroy?(): void;
};
export type Spec = { id: string; label: string; rest: string; engine: (c: EngineCtx) => EngineInstance };

export function create(spec: Spec, el: HTMLElement, options: HairlineOptions = {}): Figure {
  let opts: HairlineOptions = { ...options };
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
  el.replaceChildren(canvas);
  el.setAttribute("role", "img");
  el.tabIndex = 0;
  const label = () => opts.label ?? el.getAttribute("aria-label") ?? spec.label;
  el.setAttribute("aria-label", label());

  const g = canvas.getContext("2d")!;
  const ptr: Pointer = { x: 0.5, y: 0.5, px: 0, py: 0, down: false, inside: false };
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0, last = 0, visible = true, dead = false;
  let palCache: Palette | null = null, palAt = 0, lastRead = "";

  const pal = (): Palette => {
    const now = performance.now();
    if (palCache && now - palAt < 200) return palCache;
    const cs = getComputedStyle(el);
    const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
    const dark = opts.theme === "dark" ||
      (opts.theme !== "light" && (document.documentElement.classList.contains("dark") ||
        matchMedia("(prefers-color-scheme: dark)").matches));
    palAt = now;
    return (palCache = {
      dark,
      bg: v("--color-background", dark ? "#0a0a0a" : "#ffffff"),
      fg: v("--color-foreground", dark ? "#fafafa" : "#111111"),
      border: v("--color-border", dark ? "#333333" : "#dddddd"),
      accent: v("--color-primary", "#f59e0b"),
    });
  };

  const ctx: EngineCtx = {
    g, w: 0, h: 0, dpr: 1, pal, opts: () => opts, pointer: ptr,
    reduced: () => mq.matches,
    read: (t) => {
      if (t === lastRead) return;
      lastRead = t; el.setAttribute("aria-description", t); opts.onRead?.(t);
    },
    invalidate: () => start(),
  };
  const inst = spec.engine(ctx);

  const size = () => {
    const r = el.getBoundingClientRect();
    ctx.dpr = Math.min(devicePixelRatio || 1, 2.5);
    ctx.w = Math.max(1, r.width); ctx.h = Math.max(1, r.height);
    canvas.width = Math.round(ctx.w * ctx.dpr); canvas.height = Math.round(ctx.h * ctx.dpr);
    g.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    inst.resize?.(); start();
  };

  const tick = (now: number) => {
    raf = 0;
    const dt = Math.min((now - (last || now)) / 1000, 1 / 20); last = now;
    g.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    g.clearRect(0, 0, ctx.w, ctx.h);
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    inst.frame(mq.matches ? 0 : dt, now / 1000);
    if (visible && !dead && !mq.matches) raf = requestAnimationFrame(tick);
    else last = 0;
  };
  function start() { if (!raf && !dead) raf = requestAnimationFrame(tick); }

  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    ptr.px = e.clientX - r.left; ptr.py = e.clientY - r.top;
    ptr.x = ptr.px / r.width; ptr.y = ptr.py / r.height; start();
  };
  const on = (t: EventTarget, n: string, f: (e: any) => void) => { t.addEventListener(n, f); return () => t.removeEventListener(n, f); };
  const offs = [
    on(el, "pointermove", move),
    on(el, "pointerenter", (e: PointerEvent) => { ptr.inside = true; move(e); }),
    on(el, "pointerleave", () => { ptr.inside = false; ptr.down = false; start(); }),
    on(el, "pointerdown", (e: PointerEvent) => { ptr.down = true; ptr.inside = true; try { el.setPointerCapture(e.pointerId); } catch {} move(e); }),
    on(el, "pointerup", () => { ptr.down = false; start(); }),
    on(el, "pointercancel", () => { ptr.down = false; start(); }),
    on(el, "keydown", (e: KeyboardEvent) => { inst.key?.(e); start(); }),
    on(mq, "change", start),
  ];
  const ro = new ResizeObserver(size); ro.observe(el);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
  io.observe(el);
  const mo = new MutationObserver(() => { palCache = null; start(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
  size();

  return {
    update(o) {
      opts = { ...o, onRead: o.onRead ?? opts.onRead };
      palCache = null; el.setAttribute("aria-label", label()); inst.update?.(); start();
    },
    destroy() {
      dead = true; cancelAnimationFrame(raf); offs.forEach((f) => f());
      ro.disconnect(); io.disconnect(); mo.disconnect(); inst.destroy?.();
    },
  };
}
