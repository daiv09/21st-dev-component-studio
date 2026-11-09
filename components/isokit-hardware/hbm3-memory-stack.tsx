"use client";

import { useState, type CSSProperties } from "react";
import { Box, Plate, Press, Glow, playSound, type Box3 } from "react-isokit";
import "react-isokit/styles.css";
import "react-isokit/themes.css";

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

function shift(box: Box3, dx = 0, dy = 0, dz = 0): Box3 {
  return { ...box, x: box.x + dx, y: box.y + dy, z: box.z + dz };
}

function isoMove(
  dx = 0,
  dy = 0,
  dz = 0,
  stagger = 0,
  ease = "var(--ik-ease-move)"
): CSSProperties {
  const sx = (dx - dy) * COS;
  const sy = (dx + dy) * SIN - dz;
  return {
    transform: `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px)`,
    transition: `transform var(--ik-t-move) ${ease} calc(${stagger} * var(--ik-stagger))`,
  };
}

function LiveMark({ x, y, w }: { x: number; y: number; w: number }) {
  return <path className="ik-live" d={`M ${x} ${y} h ${w}`} />;
}

function Screen({
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
        <text
          className="ik-screen-text ik-dim"
          x={x + 4}
          y={y + 8}
          style={{ fontSize: 5 }}
        >
          {kicker}
        </text>
        <text
          className="ik-screen-text"
          x={x + 4}
          y={y + h - 4}
          style={{ fontSize: 6.5 }}
        >
          {line}
        </text>
      </Glow>
    </g>
  );
}

function plateProps(fig: string, name: string, hint: string) {
  return { fig, name, hint, aspect: 1.25, pad: 0.11 } as const;
}

const BASE: Box3 = { x: 18, y: 36, z: 0, w: 112, d: 70, h: 8 };
const SUBSTRATE: Box3 = { x: 28, y: 44, z: 8, w: 92, d: 52, h: 4 };
const GAP = 7;

function die(i: number): Box3 {
  return { x: 34, y: 50, z: 14 + i * 5, w: 80, d: 40, h: 4 };
}

export default function Hbm3MemoryStack() {
  const [open, setOpen] = useState(false);
  const layers = [0, 1, 2, 3, 4, 5, 6, 7];

  const toggle = () => {
    setOpen((was) => {
      const next = !was;
      if (next) playSound("cascade", { count: 8, stagger: 0.05 });
      else playSound("latch");
      return next;
    });
  };

  return (
    <Plate
      label="3D stacked HBM3e"
      fit={[
        BASE,
        SUBSTRATE,
        ...layers.flatMap((i) => [
          die(i),
          shift(die(i), 0, 0, i * GAP),
        ]),
      ]}
      readout={open ? "1.2 TB/s BANDWIDTH" : "stack seated · idle"}
      {...plateProps("Fig. 04", "HBM3e stack", "press the stack")}
    >
      <Box
        {...BASE}
        r={4}
        top={
          <Screen
            x={8}
            y={40}
            w={96}
            h={24}
            kicker="hbm3e"
            line={open ? "1.2 TB/s" : "seated"}
            lit={open}
          />
        }
      />
      <Box {...SUBSTRATE} r={2} />
      <Press
        label={open ? "Collapse the memory stack" : "Expand the DRAM layers"}
        material="glass"
        onPress={toggle}
      >
        <g>
          <g>
            {layers.map((i) => (
              <g key={i} style={isoMove(0, 0, open ? i * GAP : 0, i)}>
                <Box
                  {...die(i)}
                  r={1}
                  top={
                    i === 7 ? (
                      <LiveMark x={8} y={8} w={64} />
                    ) : (
                      <path className="ik-detail" d={`M 6 6 h ${68}`} />
                    )
                  }
                  front={<path className="ik-detail" d={`M 4 2 h 72`} />}
                />
              </g>
            ))}
          </g>
        </g>
      </Press>
    </Plate>
  );
}

