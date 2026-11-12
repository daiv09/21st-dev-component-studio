"use client";

// app/hairline-iso/src/kit/make.tsx
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef
} from "react";

// app/hairline-iso/src/kit/mount.ts
function create(spec, el, options = {}) {
  let opts = { ...options };
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
  el.replaceChildren(canvas);
  el.setAttribute("role", "img");
  el.tabIndex = 0;
  const label = () => opts.label ?? el.getAttribute("aria-label") ?? spec.label;
  el.setAttribute("aria-label", label());
  const g = canvas.getContext("2d");
  const ptr = { x: 0.5, y: 0.5, px: 0, py: 0, down: false, inside: false };
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0, last = 0, visible = true, dead = false;
  let palCache = null, palAt = 0, lastRead = "";
  const pal = () => {
    const now = performance.now();
    if (palCache && now - palAt < 200) return palCache;
    const cs = getComputedStyle(el);
    const v = (n, f) => cs.getPropertyValue(n).trim() || f;
    const dark = opts.theme === "dark" || opts.theme !== "light" && (document.documentElement.classList.contains("dark") || matchMedia("(prefers-color-scheme: dark)").matches);
    palAt = now;
    return palCache = {
      dark,
      bg: v("--color-background", dark ? "#0a0a0a" : "#ffffff"),
      fg: v("--color-foreground", dark ? "#fafafa" : "#111111"),
      border: v("--color-border", dark ? "#333333" : "#dddddd"),
      accent: v("--color-primary", "#f59e0b")
    };
  };
  const ctx = {
    g,
    w: 0,
    h: 0,
    dpr: 1,
    pal,
    opts: () => opts,
    pointer: ptr,
    reduced: () => mq.matches,
    read: (t) => {
      if (t === lastRead) return;
      lastRead = t;
      el.setAttribute("aria-description", t);
      opts.onRead?.(t);
    },
    invalidate: () => start()
  };
  const inst = spec.engine(ctx);
  const size = () => {
    const r = el.getBoundingClientRect();
    ctx.dpr = Math.min(devicePixelRatio || 1, 2.5);
    ctx.w = Math.max(1, r.width);
    ctx.h = Math.max(1, r.height);
    canvas.width = Math.round(ctx.w * ctx.dpr);
    canvas.height = Math.round(ctx.h * ctx.dpr);
    g.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    inst.resize?.();
    start();
  };
  const tick = (now) => {
    raf = 0;
    const dt = Math.min((now - (last || now)) / 1e3, 1 / 20);
    last = now;
    g.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    g.clearRect(0, 0, ctx.w, ctx.h);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
    inst.frame(mq.matches ? 0 : dt, now / 1e3);
    if (visible && !dead && !mq.matches) raf = requestAnimationFrame(tick);
    else last = 0;
  };
  function start() {
    if (!raf && !dead) raf = requestAnimationFrame(tick);
  }
  const move = (e) => {
    const r = el.getBoundingClientRect();
    ptr.px = e.clientX - r.left;
    ptr.py = e.clientY - r.top;
    ptr.x = ptr.px / r.width;
    ptr.y = ptr.py / r.height;
    start();
  };
  const on = (t, n, f) => {
    t.addEventListener(n, f);
    return () => t.removeEventListener(n, f);
  };
  const offs = [
    on(el, "pointermove", move),
    on(el, "pointerenter", (e) => {
      ptr.inside = true;
      move(e);
    }),
    on(el, "pointerleave", () => {
      ptr.inside = false;
      ptr.down = false;
      start();
    }),
    on(el, "pointerdown", (e) => {
      ptr.down = true;
      ptr.inside = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
      }
      move(e);
    }),
    on(el, "pointerup", () => {
      ptr.down = false;
      start();
    }),
    on(el, "pointercancel", () => {
      ptr.down = false;
      start();
    }),
    on(el, "keydown", (e) => {
      inst.key?.(e);
      start();
    }),
    on(mq, "change", start)
  ];
  const ro = new ResizeObserver(size);
  ro.observe(el);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
  });
  io.observe(el);
  const mo = new MutationObserver(() => {
    palCache = null;
    start();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
  size();
  return {
    update(o) {
      opts = { ...o, onRead: o.onRead ?? opts.onRead };
      palCache = null;
      el.setAttribute("aria-label", label());
      inst.update?.();
      start();
    },
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      offs.forEach((f) => f());
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      inst.destroy?.();
    }
  };
}

// app/hairline-iso/src/kit/make.tsx
import { jsx } from "react/jsx-runtime";
var useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
function makeFigure(spec, aspectRatio = "5 / 4") {
  const C = forwardRef(function Hairline(props, ref) {
    const { intensity, theme, label, onRead, style, ...attrs } = props;
    const named = label ?? props["aria-label"];
    const el = useRef(null);
    const fig = useRef(null);
    const read = useRef(onRead);
    const set = useCallback((n) => {
      el.current = n;
      if (typeof ref === "function") ref(n);
      else if (ref) ref.current = n;
    }, [ref]);
    useIso(() => {
      read.current = onRead;
    });
    useIso(() => {
      const f = create(spec, el.current, { intensity, theme, label: named, onRead: (t) => read.current?.(t) });
      fig.current = f;
      return () => {
        f.destroy();
        fig.current = null;
      };
    }, []);
    useIso(
      () => {
        fig.current?.update({ intensity, theme, label: named, onRead: (t) => read.current?.(t) });
      },
      [intensity, theme, named]
    );
    return /* @__PURE__ */ jsx("div", { ...attrs, ref: set, style: { aspectRatio, ...style } });
  });
  C.displayName = spec.id;
  return C;
}

// app/hairline-iso/src/kit/iso.ts
var K = 0.8660254;
var iso = (x, y, z, s = 1, ox = 0, oy = 0) => [ox + (x - y) * K * s, oy + (x + y) * 0.5 * s - z * s];
var proj = (v, x, y, z = 0) => iso(x, y, z, v.s, v.ox, v.oy);
var probe = null;
var cache = /* @__PURE__ */ new Map();
function rgba(color) {
  const hit = cache.get(color);
  if (hit) return hit;
  if (!probe) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    probe = cv.getContext("2d", { willReadFrequently: true });
  }
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  const out = [d[0], d[1], d[2], d[3] / 255];
  if (cache.size > 400) cache.clear();
  cache.set(color, out);
  return out;
}
var sh = /* @__PURE__ */ new Map();
function shade(color, k) {
  const key = color + "|" + k;
  const hit = sh.get(key);
  if (hit) return hit;
  const [r, g, b] = rgba(color);
  const f = (c) => Math.round(k <= 1 ? c * k : c + (255 - c) * (k - 1));
  const out = `rgb(${f(r)},${f(g)},${f(b)})`;
  if (sh.size > 800) sh.clear();
  sh.set(key, out);
  return out;
}
function alpha(color, a) {
  const [r, g, b] = rgba(color);
  return `rgba(${r},${g},${b},${a})`;
}
function poly(g, pts, fill, stroke, lw = 1) {
  g.beginPath();
  pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.closePath();
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = lw;
    g.stroke();
  }
}
function line(g, a, b, stroke, lw = 1) {
  g.strokeStyle = stroke;
  g.lineWidth = lw;
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
}
function dot(g, p, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(p[0], p[1], r, 0, Math.PI * 2);
  g.fill();
}
var FACES = { t: 1.15, l: 0.8, r: 0.6 };
function box(g, v, x, y, z, w, d, h, base, edge, k = FACES) {
  const P = (a, b, c) => proj(v, a, b, c);
  poly(g, [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], shade(base, k.t), edge);
  poly(g, [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], shade(base, k.l), edge);
  poly(g, [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], shade(base, k.r), edge);
}
function circle(v, cx, cy, cz, r, axis, n = 40, rot = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * Math.PI * 2, c = Math.cos(a) * r, s = Math.sin(a) * r;
    out.push(axis === "x" ? proj(v, cx, cy + c, cz + s) : axis === "y" ? proj(v, cx + c, cy, cz + s) : proj(v, cx + c, cy + s, cz));
  }
  return out;
}
function grid(g, v, x0, x1, y0, y1, step, stroke, z = 0) {
  g.strokeStyle = stroke;
  g.lineWidth = 1;
  g.beginPath();
  for (let x = x0; x <= x1 + 1e-6; x += step) {
    const a = proj(v, x, y0, z), b = proj(v, x, y1, z);
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
  }
  for (let y = y0; y <= y1 + 1e-6; y += step) {
    const a = proj(v, x0, y, z), b = proj(v, x1, y, z);
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
  }
  g.stroke();
}

// app/hairline-iso/src/kit/motion.ts
var clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
var lerp = (a, b, t) => a + (b - a) * t;
var damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

// app/hairline-iso/src/components/hydraulic-arm/hydraulic-arm-engine.ts
var L1 = 3.3;
var L2 = 3.1;
var BZ = 0.9;
var HALF = 4;
function mount(c) {
  const blocks = [];
  const colors = ["#f59e0b", "#38bdf8", "#a78bfa", "#ec4899", "#10b981", "#ef4444"];
  while (blocks.length < 8) {
    const rx = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
    const ry = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
    if (Math.hypot(rx, ry) < 1.5) continue;
    if (!blocks.some((b) => b.x === rx && b.y === ry)) {
      blocks.push({ x: rx, y: ry, z: 0, col: colors[Math.floor(Math.random() * colors.length)] });
    }
  }
  let held = null;
  let yaw = 0.6, rr = 3.5, zz = 3.2, grip = 0.75;
  let op = "none";
  let opX = 0, opY = 0, opTime = 0;
  let opBlock = null;
  const occupied = (x, y, ex) => blocks.some((b) => b !== ex && Math.abs(b.x - x) < 0.5 && Math.abs(b.y - y) < 0.5);
  const frame = (dt, t) => {
    const { g, w, h } = c, pal = c.pal();
    const s = Math.min(w / 17, h / 13);
    const v = { s, ox: w / 2, oy: h * 0.58 };
    const ln = alpha(pal.fg, 0.35);
    if (op === "none") {
      if (!held) {
        const targetBlock = blocks[Math.floor(Math.random() * blocks.length)];
        op = "grab";
        opX = targetBlock.x;
        opY = targetBlock.y;
        opBlock = targetBlock;
        opTime = 0;
      } else {
        let cx = 0, cy2 = 0, tries = 0;
        do {
          cx = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
          cy2 = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
          tries++;
        } while ((occupied(cx, cy2, held) || Math.hypot(cx, cy2) < 1.5) && tries < 100);
        op = "drop";
        opX = cx;
        opY = cy2;
        opTime = 0;
      }
    }
    let targetZ = 3.2;
    let targetR = clamp(Math.hypot(opX, opY), 1.2, L1 + L2 - 0.1);
    let targetYaw = Math.atan2(opY, opX);
    let targetGrip = held ? 0.44 : 0.75;
    if (op !== "none") {
      opTime += dt;
      if (opTime < 0.6) {
        targetZ = 3.2;
        targetGrip = held ? 0.44 : 0.75;
      } else if (opTime < 1.1) {
        targetZ = 1.5;
      } else if (opTime < 1.4) {
        targetZ = 1.5;
        if (op === "grab") {
          targetGrip = 0.44;
          if (opTime > 1.3 && opBlock) {
            held = opBlock;
            opBlock = null;
          }
        } else if (op === "drop") {
          targetGrip = 0.75;
          if (opTime > 1.3 && held) {
            held.x = opX;
            held.y = opY;
            held.z = 0;
            held = null;
          }
        }
      } else if (opTime < 1.9) {
        targetZ = 3.2;
      } else {
        op = "none";
      }
    }
    let dyaw = targetYaw - yaw;
    dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
    yaw += dyaw * (1 - Math.exp(-8 * dt));
    rr = damp(rr, targetR, 10, dt);
    zz = damp(zz, targetZ, 10, dt);
    grip = damp(grip, targetGrip, 20, dt);
    const shZ = BZ + 0.2;
    const dz = zz - shZ, d = clamp(Math.hypot(rr, dz), 0.8, L1 + L2 - 0.02);
    const a = Math.atan2(dz, rr), sh2 = a + Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const er = L1 * Math.cos(sh2), ez = shZ + L1 * Math.sin(sh2);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const RZ = (r, z, offset = 0) => proj(v, r * cy - sy * offset, r * sy + cy * offset, z);
    const getP = (pct, rA, zA, rB, zB, zOff) => RZ(rA + (rB - rA) * pct, zA + (zB - zA) * pct + zOff);
    const shoulder = RZ(0, shZ);
    const elbow = RZ(er, ez);
    const wrist = RZ(rr, zz);
    grid(g, v, -HALF - 0.5, HALF + 0.5, -HALF - 0.5, HALF + 0.5, 1, alpha(pal.fg, 0.12));
    if (op !== "none") {
      poly(g, [
        proj(v, opX - 0.5, opY - 0.5),
        proj(v, opX + 0.5, opY - 0.5),
        proj(v, opX + 0.5, opY + 0.5),
        proj(v, opX - 0.5, opY + 0.5)
      ], alpha(pal.accent, 0.25), pal.accent);
    }
    const drawShadow = (bx, by, rad, alphaMult = 1) => poly(g, circle(v, bx, by, rad, 0, "z"), alpha(pal.fg, 0.12 * alphaMult), "transparent");
    for (const b of blocks) if (b !== held) drawShadow(b.x, b.y, 0.4);
    const shadowScale = clamp(3 / zz, 0.5, 1.2);
    drawShadow(rr * cy, rr * sy, 0.35 * shadowScale, shadowScale);
    const sorted = [...blocks].filter((b) => b !== held).sort((A, B) => A.x + A.y - B.x - B.y);
    for (const b of sorted) box(g, v, b.x - 0.4, b.y - 0.4, b.z, 0.8, 0.8, 0.8, b.col, ln);
    box(g, v, -0.8, -0.8, 0, 1.6, 1.6, BZ - 0.15, pal.bg, ln);
    box(g, v, -0.6, -0.6, BZ - 0.15, 1.2, 1.2, 0.15, pal.border, ln);
    const lw = Math.max(6, s * 0.35);
    const drawLink = (p1, p2) => {
      line(g, p1, p2, pal.fg, lw);
      line(g, p1, p2, alpha(pal.bg, 0.3), lw * 0.2);
    };
    drawLink(shoulder, elbow);
    drawLink(elbow, wrist);
    const drawHydraulic = (pA, pB) => {
      const mid = [pA[0] * 0.55 + pB[0] * 0.45, pA[1] * 0.55 + pB[1] * 0.45];
      line(g, pA, mid, pal.border, lw * 0.7);
      line(g, mid, pB, pal.accent, lw * 0.25);
    };
    drawHydraulic(RZ(-0.6, shZ - 0.1), getP(0.45, 0, shZ, er, ez, 0.3));
    drawHydraulic(getP(0.7, 0, shZ, er, ez, 0.25), getP(0.35, er, ez, rr, zz, 0.25));
    for (const j of [shoulder, elbow, wrist]) {
      dot(g, j, lw * 0.85, pal.bg);
      dot(g, j, lw * 0.45, pal.accent);
      dot(g, j, lw * 0.15, pal.fg);
    }
    const handBase = RZ(rr, zz - 0.3);
    line(g, wrist, handBase, pal.fg, lw * 0.8);
    dot(g, handBase, lw * 0.5, pal.bg);
    dot(g, handBase, lw * 0.2, pal.fg);
    const drawJaw = (sign) => {
      const j0 = RZ(rr, zz - 0.3, 0);
      const j1 = RZ(rr, zz - 0.3, grip * sign);
      const j2 = RZ(rr, zz - 0.7, grip * sign);
      const j3 = RZ(rr, zz - 0.7, (grip - 0.15) * sign);
      line(g, j0, j1, pal.fg, lw * 0.5);
      line(g, j1, j2, pal.fg, lw * 0.5);
      line(g, j2, j3, pal.fg, lw * 0.4);
    };
    drawJaw(1);
    drawJaw(-1);
    for (const b of blocks) if (b !== held) b.z = damp(b.z, 0, 15, dt);
    if (held) {
      held.x = rr * cy;
      held.y = rr * sy;
      held.z = zz - 1.5;
      box(g, v, held.x - 0.4, held.y - 0.4, held.z, 0.8, 0.8, 0.8, held.col, ln);
    }
    c.read(held ? "Autonomous arm is relocating a block" : "Autonomous arm is securing the next block");
    void t;
  };
  return { frame };
}

// app/hairline-iso/src/components/hydraulic-arm/index.tsx
var index_default = makeFigure({
  id: "hydraulic-arm",
  rest: "rest",
  engine: mount,
  label: "A fully autonomous three-axis robotic arm continuously seeking, picking up, and dropping randomly generated blocks around a grid."
}, "5 / 4");
export {
  index_default as default
};
