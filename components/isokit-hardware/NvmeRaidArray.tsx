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

const SHELF: Box3 = { x: 0, y: 24, z: 0, w: 168, d: 78, h: 8 };
const RAIL: Box3 = { x: 0, y: 24, z: 8, w: 168, d: 8, h: 58 };
const EJECT = 32;

function caddy(i: number): Box3 {
  return { x: 8 + i * 40, y: 36, z: 8, w: 32, d: 48, h: 58 };
}

export default function NvmeRaidArray() {
  const [ejected, setEjected] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [focus, setFocus] = useState(0);
  const motor = useMotor();
  const bays = [0, 1, 2, 3];
  const seated = ejected.filter((open) => !open).length;

  const toggle = (index: number) => {
    setFocus(index);
    setEjected((prev) =>
      prev.map((open, i) => (i === index ? !open : open))
    );
    motor.start(0.55);
    playSound("tick");
  };

  const order = [...bays].sort(
    (a, b) => Number(ejected[a]) - Number(ejected[b]) || a - b
  );
  const healthy = seated === 4;

  return (
    <Plate
      label="4-bay hot-swap NVMe backplane"
      fit={[
        SHELF,
        RAIL,
        ...bays.flatMap((i) => [
          caddy(i),
          shift(caddy(i), 4, EJECT, 0),
        ]),
      ]}
      readout={
        healthy
          ? "RAID-0 STRIPED · 28.4 GB/s"
          : `bay ${focus + 1} ${ejected[focus] ? "out" : "in"} · ${seated}/4 seated`
      }
      {...plateProps("Fig. 05", "NVMe RAID", "press a caddy")}
    >
      <Box
        {...SHELF}
        r={3}
        top={
          <Screen
            x={8}
            y={46}
            w={110}
            h={24}
            kicker="raid 0"
            line={healthy ? "28.4 GB/s" : `${seated} of 4`}
            lit={healthy}
          />
        }
      />
      <Box {...RAIL} r={2} />
      {order.map((i) => {
        const body = caddy(i);
        return (
          <Press
            key={i}
            label={`${ejected[i] ? "Insert" : "Eject"} NVMe bay ${i + 1}`}
            material="metal"
            onPress={() => toggle(i)}
          >
            <g>
              <g
                style={isoMove(
                  ejected[i] ? 4 : 0,
                  ejected[i] ? EJECT : 0,
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
                        x={6}
                        y={8}
                        width={body.w - 12}
                        height={28}
                        rx={2}
                      />
                      <text
                        className="ik-label"
                        x={8}
                        y={body.h - 8}
                        style={{ fontSize: 5 }}
                      >{`NV${i + 1}`}</text>
                      {focus === i && (
                        <LiveMark x={6} y={42} w={body.w - 12} />
                      )}
                    </g>
                  }
                  side={
                    <g>
                      {[0, 1, 2].map((n) => (
                        <rect
                          key={n}
                          className="ik-well"
                          x={6}
                          y={10 + n * 12}
                          width={body.d - 14}
                          height={3}
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
