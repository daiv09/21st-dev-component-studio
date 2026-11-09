"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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

function useMotor() {
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

const FLOOR: Box3 = { x: 8, y: 6, z: 0, w: 148, d: 86, h: 6 };
const LEFT: Box3 = { x: 8, y: 6, z: 6, w: 10, d: 86, h: 72 };
const RIGHT: Box3 = { x: 146, y: 6, z: 6, w: 10, d: 86, h: 72 };
const BACK: Box3 = { x: 18, y: 6, z: 6, w: 128, d: 8, h: 72 };
const SLIDE_X = 12;
const SLIDE_Y = 30;

function blade(i: number): Box3 {
  return { x: 22, y: 16, z: 10 + i * 16, w: 118, d: 56, h: 13 };
}

const LINES = [
  "rack idle · blades seated",
  "bay travel · motor out",
  "8x H100 SXM5 · 32 PFLOPS",
];

export default function NvidiaDgxPod() {
  const [out, setOut] = useState<boolean[]>([false, false, false, false]);
  const [focus, setFocus] = useState(0);
  const [line, setLine] = useState(0);
  const motor = useMotor();
  const blades = [0, 1, 2, 3];

  const toggle = (index: number) => {
    setOut((prev) => prev.map((open, i) => (i === index ? !open : open)));
    setFocus(index);
    setLine((n) => (n + 1) % LINES.length);
    motor.start(0.7);
    playSound("tick");
  };

  const order = [...blades].sort(
    (a, b) => Number(out[a]) - Number(out[b]) || a - b
  );

  return (
    <Plate
      label="NVIDIA DGX SuperPOD rack"
      fit={[
        FLOOR,
        LEFT,
        RIGHT,
        BACK,
        ...blades.flatMap((i) => [
          blade(i),
          shift(blade(i), SLIDE_X, SLIDE_Y, 0),
        ]),
      ]}
      readout={LINES[line]}
      {...plateProps("Fig. 01", "DGX SuperPOD", "press a blade")}
    >
      <Box {...FLOOR} r={4} />
      <Box {...BACK} r={2} />
      <Box
        {...RIGHT}
        r={2}
        side={
          <Screen
            x={6}
            y={8}
            w={72}
            h={24}
            kicker="superpod"
            line={out.some(Boolean) ? "32 PF" : "idle"}
            lit={out.some(Boolean)}
          />
        }
      />
      <Box
        {...LEFT}
        r={2}
        side={
          <g>
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                className="ik-detail"
                d={`M 8 ${14 + i * 16} h 70`}
              />
            ))}
          </g>
        }
      />
      {order.map((i) => {
        const body = blade(i);
        return (
          <Press
            key={i}
            label={`Slide blade U${i + 1}`}
            material="metal"
            onPress={() => toggle(i)}
          >
            <g>
              <g
                style={isoMove(
                  out[i] ? SLIDE_X : 0,
                  out[i] ? SLIDE_Y : 0,
                  0
                )}
              >
                <Box
                  {...body}
                  r={3}
                  front={
                    <g>
                      <rect
                        className="ik-well"
                        x={8}
                        y={3}
                        width={body.w - 16}
                        height={3}
                        rx={1}
                      />
                      <text
                        className="ik-label"
                        x={10}
                        y={body.h - 2}
                        style={{ fontSize: 5 }}
                      >{`U${i + 1}`}</text>
                      {focus === i && (
                        <LiveMark x={10} y={8} w={body.w - 20} />
                      )}
                    </g>
                  }
                  top={
                    <g>
                      {[0, 1, 2, 3, 4].map((n) => (
                        <rect
                          key={n}
                          className="ik-well"
                          x={10 + n * 20}
                          y={8}
                          width={12}
                          height={body.d - 16}
                          rx={1}
                        />
                      ))}
                    </g>
                  }
                />
              </g>
            </g>
          </Press>
        );
      })}
    </Plate>
  );
}

