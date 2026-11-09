"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Glow, playSound, type Box3 } from "react-isokit";
import "react-isokit/styles.css";
import "react-isokit/themes.css";
import "./hardware.css";

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

export function shift(box: Box3, dx = 0, dy = 0, dz = 0): Box3 {
  return { ...box, x: box.x + dx, y: box.y + dy, z: box.z + dz };
}

export function isoMove(dx = 0, dy = 0, dz = 0, stagger = 0, ease = "var(--ik-ease-move)"): CSSProperties {
  const sx = (dx - dy) * COS;
  const sy = (dx + dy) * SIN - dz;
  return {
    transform: `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px)`,
    transition: `transform var(--ik-t-move) ${ease} calc(${stagger} * var(--ik-stagger))`,
  };
}

export function useMotor() {
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);
  return {
    start(duration: number) {
      stop.current?.();
      stop.current = playSound("motor", { duration });
    },
    cut() {
      stop.current?.();
      stop.current = null;
    },
  };
}

export function useInterval() {
  const id = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (id.current) window.clearInterval(id.current);
    },
    [],
  );
  return {
    start(tick: () => boolean, ms: number) {
      if (id.current) window.clearInterval(id.current);
      id.current = window.setInterval(() => {
        const done = tick();
        if (done && id.current) {
          window.clearInterval(id.current);
          id.current = null;
        }
      }, ms);
    },
    clear() {
      if (id.current) window.clearInterval(id.current);
      id.current = null;
    },
  };
}

export function Screen({
  x,
  y,
  w,
  h,
  kicker,
  line,
  lit,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  kicker: string;
  line: string;
  lit?: boolean;
}) {
  return (
    <g>
      <rect className="ik-screen" x={x} y={y} width={w} height={h} rx={2} />
      <Glow on={!!lit}>
        <text className="ik-screen-text ik-dim" x={x + 4} y={y + 8} style={{ fontSize: 5 }}>
          {kicker}
        </text>
        <text className="ik-screen-text" x={x + 4} y={y + h - 4} style={{ fontSize: 6.5 }}>
          {line}
        </text>
      </Glow>
    </g>
  );
}

export function Vents({ x, y, count, gap, length }: { x: number; y: number; count: number; gap: number; length: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <path key={i} className="ik-detail" d={`M ${x} ${y + i * gap} h ${length}`} />
      ))}
    </g>
  );
}

export function LiveMark({ x, y, w }: { x: number; y: number; w: number }) {
  return <path className="ik-live" d={`M ${x} ${y} h ${w}`} />;
}

export function Rotor({ cx, cy, r, spin }: { cx: number; cy: number; r: number; spin: boolean }) {
  return (
    <g className="ik-hw-rotor ik-loop" data-spin={spin ? "true" : "false"} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <circle className="ik-well" cx={cx} cy={cy} r={r} />
      <path className="ik-detail" d={`M ${cx} ${cy - r + 2} V ${cy + r - 2} M ${cx - r + 2} ${cy} H ${cx + r - 2}`} />
      <circle className="ik-fill" cx={cx} cy={cy} r={Math.max(2, r * 0.22)} />
    </g>
  );
}

export function plateProps(fig: string, name: string, hint: string) {
  return { fig, name, hint, aspect: 1.25, pad: 0.11 } as const;
}
