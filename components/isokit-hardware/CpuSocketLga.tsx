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

const BOARD: Box3 = { x: 0, y: 0, z: 0, w: 168, d: 112, h: 8 };
const SOCKET: Box3 = { x: 38, y: 24, z: 8, w: 76, d: 64, h: 5 };
const IHS: Box3 = { x: 48, y: 32, z: 13, w: 56, d: 48, h: 5 };
const BAR: Box3 = { x: 40, y: 22, z: 13, w: 72, d: 8, h: 4 };
const LEVER: Box3 = { x: 122, y: 28, z: 8, w: 14, d: 58, h: 6 };
const OPEN_Z = 16;

export default function CpuSocketLga() {
  const [latched, setLatched] = useState(true);

  const toggle = () => {
    setLatched((closed) => {
      const next = !closed;
      playSound(next ? "latch" : "whoosh");
      return next;
    });
  };

  return (
    <Plate
      label="LGA CPU and retention lever"
      fit={[
        BOARD,
        SOCKET,
        IHS,
        shift(IHS, 0, 0, OPEN_Z),
        BAR,
        shift(BAR, 6, -4, OPEN_Z),
        LEVER,
        shift(LEVER, 10, 0, OPEN_Z),
      ]}
      readout={
        latched ? "LGA-1851 · 24 CORES LOCKED" : "lever open · die free"
      }
      {...plateProps("Fig. 03", "LGA socket", "press the lever")}
    >
      <Box
        {...BOARD}
        r={4}
        top={
          <Screen
            x={112}
            y={74}
            w={48}
            h={26}
            kicker="socket"
            line={latched ? "locked" : "open"}
            lit={latched}
          />
        }
      />
      <Box
        {...SOCKET}
        r={2}
        top={
          <g>
            {Array.from({ length: 36 }, (_, n) => (
              <circle
                key={n}
                className="ik-fill"
                cx={8 + (n % 6) * 10}
                cy={8 + Math.floor(n / 6) * 8}
                r={1.1}
              />
            ))}
          </g>
        }
      />
      <g
        style={isoMove(
          0,
          0,
          latched ? 0 : OPEN_Z,
          0,
          "var(--ik-ease-fall)"
        )}
      >
        <Box
          {...IHS}
          r={2}
          top={
            <text
              className="ik-label"
              x={10}
              y={28}
              style={{ fontSize: 6 }}
            >
              IHS
            </text>
          }
        />
      </g>
      <Press
        label={
          latched
            ? "Unlatch the retention lever"
            : "Latch the CPU"
        }
        material="metal"
        onPress={toggle}
      >
        <g>
          <g
            style={isoMove(
              latched ? 0 : 10,
              latched ? 0 : -2,
              latched ? 0 : OPEN_Z
            )}
          >
            <Box {...BAR} r={1} />
            <Box
              {...LEVER}
              r={2}
              top={
                latched ? (
                  <path className="ik-detail" d="M 3 8 h 8" />
                ) : (
                  <LiveMark x={2} y={10} w={10} />
                )
              }
              front={
                <text
                  className="ik-label"
                  x={2}
                  y={5}
                  style={{ fontSize: 4 }}
                >
                  ARM
                </text>
              }
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
