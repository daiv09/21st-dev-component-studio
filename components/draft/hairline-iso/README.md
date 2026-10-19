# hairline-iso — 20 isometric canvas figures

React + Canvas 2D figures built on the same single-mount pattern as the `Elevator` component:
one empty `<div>`, mounted once in a layout effect, options pushed through `update()`, `onRead` held in a ref.
No runtime dependencies beyond React.

## Layout
```
src/
  kit/
    mount.ts      create(spec, el, options) → { update, destroy }. One rAF loop, DPR-scaled canvas,
                  pointer/keyboard, IntersectionObserver pause, prefers-reduced-motion, theme tokens.
    iso.ts        projection (iso / unIso / proj / unproj), colour helpers, box / wire / circle / grid primitives.
    motion.ts     clamp, lerp, damp (frame-rate independent), spring, wave, seeded rng, fixed-step runner.
    noise.ts      seeded value noise + fBm.
    make.tsx      makeFigure(spec) → forwardRef React component (same wrapper as Elevator).
  components/<name>/
    <name>-engine.ts   pure engine: mount(ctx) → { frame(dt, t), key?, update?, destroy? }
    index.tsx          makeFigure({...}) default export
    demo.tsx           embed example
  index.ts        named exports for all 20
  demo-all.tsx    gallery with a theme switcher
```

## Use
```tsx
import { PistonEngine } from "./src";
<PistonEngine className="w-full max-w-md" intensity={0.6} aria-label="Piston engine" />
```
Props: `intensity` (0–1, meaning is per figure), `theme` ("light" | "dark" | "auto"), `label`, `onRead(text)`,
plus any `<div>` attribute. Colours come from `--color-background`, `--color-foreground`,
`--color-border`, `--color-primary` (with fallbacks), so Tailwind/shadcn tokens just work.

To drop into a shadcn-style registry, copy `src/kit/` once and each `components/<name>/` folder;
the `@/*` path alias in `tsconfig.json` points at `src/`.
If your real `mount.ts` differs from `kit/mount.ts`, only that file (and `make.tsx`) needs adapting.

## The 20
| # | Folder | Interaction |
|---|---|---|
| 1 | piston-engine | pointer height = throttle, press = boost, ↑/↓ trim |
| 2 | hydraulic-arm | pointer picks a cell, click grabs/places, Space/Enter too |
| 3 | escapement-clock | drag sideways or ←/→ = mainspring tension |
| 4 | sorting-conveyor | `intensity` = throughput + size cut-offs |
| 5 | microservice-mesh | hover a node |
| 6 | timeseries-aggregator | hover a column |
| 7 | vector-space | hover a point, drag to rotate |
| 8 | k8s-orchestrator | press to spike load |
| 9 | kanban-lanes | drag cards; ↑/↓ select, ←/→ move |
| 10 | pomodoro-tower | click / Space pause, R reset |
| 11 | habit-amphitheater | click a day; ←/→ + Space |
| 12 | git-branch-visualizer | C commit · B branch · M merge · Enter resolve · click |
| 13 | order-book-wall | pointer X moves the mid price |
| 14 | transaction-routing-mesh | hover a gateway, click to fail it |
| 15 | portfolio-city | hover a tower |
| 16 | revenue-terrain | pointer X scrubs; ←/→ |
| 17 | equalizer-grid | M toggles microphone input |
| 18 | attention-matrix | hover top-layer token; ←/→ |
| 19 | terrain-generator | three canvas sliders; ↑/↓ + ←/→ |
| 20 | digital-rain | hover / touch resolves glyphs into blocks |

## Known limits
- #4 is a single-level conveyor with three lanes (no vertical floors).
- #12 has commit, branch, merge and conflict nodes; rebase is not implemented.
- #17 mic mode needs a secure context and permission; otherwise a synthetic spectrum runs.
- #19 is the heaviest figure (324 voxel columns redrawn per frame).
- Tested by type-checking (`npm run typecheck`) and by rendering every engine headlessly in Node
  (dark + light, with pointer/keys, ~0.3–8 ms/frame in a software canvas). Not yet run in a real browser,
  so expect to tune framing and the feel of interactions.
