"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
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

function plateProps(fig: string, name: string, hint: string) {
  return { fig, name, hint, aspect: 1.25, pad: 0.11 } as const;
}

const RACK: Box3 = { x: 6, y: 8, z: 0, w: 156, d: 40, h: 14 };
const DRAWER: Box3 = { x: 14, y: 14, z: 4, w: 140, d: 46, h: 8 };
const LID: Box3 = { x: 20, y: 16, z: 12, w: 128, d: 24, h: 6 };
const DRAWER_Y = 42;
const LID_Z = 28;

export default function KvmConsoleCrashCart() {
  const [open, setOpen] = useState(false);
  const motor = useMotor();

  const toggle = () => {
    setOpen((was) => {
      const next = !was;
      motor.start(0.7);
      window.setTimeout(
        () => playSound(next ? "latch" : "whoosh"),
        420
      );
      return next;
    });
  };

  return (
    <Plate
      label="1U rackmount pull-out KVM console"
      fit={[
        RACK,
        DRAWER,
        shift(DRAWER, 0, DRAWER_Y, 0),
        LID,
        shift(LID, 0, DRAWER_Y - 8, LID_Z),
      ]}
      readout={open ? "NODE-01 TTY1 · ONLINE" : "console stowed"}
      {...plateProps("Fig. 18", "KVM crash cart", "press the drawer")}
    >
      <Box
        {...RACK}
        r={3}
        front={<path className="ik-detail" d="M 10 6 h 120" />}
      />
      <Press
        label={
          open
            ? "Stow the KVM drawer"
            : "Pull out the KVM console"
        }
        material="metal"
        onPress={toggle}
      >
        <g>
          <g style={isoMove(0, open ? DRAWER_Y : 0, 0)}>
            <Box
              {...DRAWER}
              r={2}
              top={
                <g>
                  {Array.from({ length: 24 }, (_, n) => (
                    <rect
                      key={n}
                      className="ik-well"
                      x={8 + (n % 8) * 15}
                      y={8 + Math.floor(n / 8) * 10}
                      width={11}
                      height={6}
                      rx={1}
                    />
                  ))}
                </g>
              }
            />
            <g
              style={isoMove(
                0,
                open ? -8 : 0,
                open ? LID_Z : 0,
                2
              )}
            >
              <Box
                {...LID}
                r={2}
                front={
                  open ? (
                    <LiveMark x={8} y={3} w={112} />
                  ) : (
                    <path className="ik-detail" d="M 8 3 h 112" />
                  )
                }
                top={
                  <text
                    className="ik-label"
                    x={8}
                    y={14}
                    style={{ fontSize: 6 }}
                  >
                    NODE-01
                  </text>
                }
              />
            </g>
          </g>
        </g>
      </Press>
    </Plate>
  );
}
