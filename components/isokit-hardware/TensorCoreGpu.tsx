"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Box, Plate, type Box3 } from "react-isokit";
import "react-isokit/styles.css";
import "react-isokit/themes.css";

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

function shift(box: Box3, dx = 0, dy = 0, dz = 0): Box3 {
  return { ...box, x: box.x + dx, y: box.y + dy, z: box.z + dz };
}

function Vents({
  x,
  y,
  count,
  gap,
  length,
}: {
  x: number;
  y: number;
  count: number;
  gap: number;
  length: number;
}) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          className="ik-detail"
          d={`M ${x} ${y + i * gap} h ${length}`}
        />
      ))}
    </g>
  );
}

function LiveMark({ x, y, w }: { x: number; y: number; w: number }) {
  return <path className="ik-live" d={`M ${x} ${y} h ${w}`} />;
}

function Rotor({
  cx,
  cy,
  r,
}: {
  cx: number;
  cy: number;
  r: number;
}) {
  return (
    <g
      className="ik-hw-rotor"
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <circle className="ik-well" cx={cx} cy={cy} r={r} />
      <path
        className="ik-detail"
        d={`M ${cx} ${cy - r + 2} V ${cy + r - 2} M ${cx - r + 2} ${cy} H ${cx + r - 2}`}
      />
      <circle className="ik-fill" cx={cx} cy={cy} r={Math.max(2, r * 0.22)} />
    </g>
  );
}

function plateProps(fig: string, name: string, hint: string) {
  return { fig, name, hint, aspect: 1.25, pad: 0.11 } as const;
}

const PCB: Box3 = { x: 4, y: 22, z: 0, w: 158, d: 70, h: 6 };
const FINGERS: Box3 = { x: 10, y: 92, z: 1, w: 146, d: 12, h: 3 };
const BRACKET: Box3 = { x: 0, y: 16, z: 0, w: 8, d: 92, h: 42 };
const SHROUD: Box3 = { x: 16, y: 30, z: 20, w: 136, d: 50, h: 10 };
const LIFT = 8;

function fin(i: number): Box3 {
  return { x: 22 + i * 20, y: 34, z: 6, w: 12, d: 42, h: 14 };
}

export default function TensorCoreGpu() {
  return (
    <>
      <Plate
        label="Triple-fan flagship GPU"
        fit={[
          PCB,
          FINGERS,
          BRACKET,
          ...[0, 1, 2, 3, 4, 5].map(fin),
          SHROUD,
          shift(SHROUD, 0, 0, LIFT),
        ]}
        data-run={"off"}
        {...plateProps("", "Tensor GPU", "")}
      >
        <Box
          {...PCB}
          r={3}
          top={<Vents x={12} y={8} count={4} gap={14} length={130} />}
        />
        <Box
          {...FINGERS}
          r={1}
          top={
            <g>
              {Array.from({ length: 14 }, (_, i) => (
                <rect
                  key={i}
                  className="ik-fill"
                  x={6 + i * 10}
                  y={2}
                  width={4}
                  height={8}
                />
              ))}
            </g>
          }
        />
        <Box
          {...BRACKET}
          r={2}
          front={
            <path className="ik-detail" d="M 1 8 h 6 M 1 16 h 6 M 1 24 h 6" />
          }
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Box key={i} {...fin(i)} r={1} />
        ))}
        <g>
          <Box
            {...SHROUD}
            r={4}
            top={
              <g>
                <Rotor cx={28} cy={25} r={14} />
                <Rotor cx={68} cy={25} r={14} />
                <Rotor cx={108} cy={25} r={14} />
                <LiveMark x={18} y={6} w={100} />
              </g>
            }
            front={<path className="ik-detail" d="M 12 5 h 112" />}
          />
        </g>
      </Plate>
    </>
  );
}