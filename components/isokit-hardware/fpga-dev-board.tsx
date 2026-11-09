"use client";

import { useState, type CSSProperties } from "react";
import { Box, Plate, Press, Glow, playSound, type Box3 } from "react-isokit";
import "react-isokit/styles.css";
import "react-isokit/themes.css";

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

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

const BOARD: Box3 = { x: 0, y: 8, z: 0, w: 168, d: 112, h: 8 };
const JTAG: Box3 = { x: 136, y: 18, z: 8, w: 24, d: 18, h: 6 };

function cell(col: number, row: number): Box3 {
  return { x: 18 + col * 26, y: 16 + row * 18, z: 8, w: 20, d: 14, h: 8 };
}

function dip(i: number): Box3 {
  return { x: 18 + i * 28, y: 92, z: 8, w: 20, d: 16, h: 6 };
}

export default function FpgaDevBoard() {
  const [bits, setBits] = useState<boolean[]>([false, false, false, false]);
  const on = bits.filter(Boolean).length;
  const lut = on * 22;

  const toggle = (index: number) => {
    setBits((prev) => prev.map((bit, i) => (i === index ? !bit : bit)));
    playSound("tick");
  };

  return (
    <Plate
      label="FPGA prototyping matrix board"
      fit={[
        BOARD,
        JTAG,
        ...[0, 1, 2, 3].flatMap((col) =>
          [0, 1, 2, 3].map((row) => ({ ...cell(col, row), z: 16 }))
        ),
        ...[0, 1, 2, 3].flatMap((i) => [
          dip(i),
          { ...dip(i), y: dip(i).y + 8 },
        ]),
      ]}
      readout={
        on === 4
          ? "BITSTREAM LOADED · LUT 88%"
          : on === 0
          ? "awaiting bitstream"
          : `partial · LUT ${lut}%`
      }
      {...plateProps("Fig. 15", "FPGA board", "press a dip switch")}
    >
      <Box
        {...BOARD}
        r={4}
        top={
          <Screen
            x={112}
            y={78}
            w={48}
            h={26}
            kicker="lut"
            line={on === 4 ? "88%" : `${lut}%`}
            lit={on > 0}
          />
        }
      />
      <Box
        {...JTAG}
        r={1}
        top={
          <g>
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                className="ik-fill"
                cx={4 + i * 5}
                cy={9}
                r={1.2}
              />
            ))}
          </g>
        }
      />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <g
            key={`${col}-${row}`}
            style={isoMove(0, 0, bits[col] ? 6 : 0, row)}
          >
            <Box
              {...cell(col, row)}
              r={1}
              top={
                bits[col] && row === 0 && col === bits.findIndex(Boolean) ? (
                  <LiveMark x={2} y={4} w={16} />
                ) : (
                  <rect
                    className="ik-well"
                    x={3}
                    y={3}
                    width={14}
                    height={8}
                  />
                )
              }
            />
          </g>
        ))
      )}
      {[0, 1, 2, 3].map((i) => (
        <Press
          key={i}
          label={`Toggle FPGA switch ${i + 1}`}
          material="plastic"
          onPress={() => toggle(i)}
        >
          <g>
            <g
              style={isoMove(
                0,
                bits[i] ? 8 : 0,
                bits[i] ? 2 : 0
              )}
            >
              <Box
                {...dip(i)}
                r={2}
                top={
                  <text
                    className="ik-label"
                    x={4}
                    y={11}
                    style={{ fontSize: 5 }}
                  >{`S${i + 1}`}</text>
                }
              />
            </g>
          </g>
        </Press>
      ))}
    </Plate>
  );
}

