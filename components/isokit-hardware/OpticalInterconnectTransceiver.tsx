"use client";

import { useState, type CSSProperties } from "react";
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

function LiveMark({ x, y, w }: { x: number; y: number; w: number }) {
  return <path className="ik-live" d={`M ${x} ${y} h ${w}`} />;
}

function plateProps(fig: string, name: string, hint: string) {
  return { fig, name, hint, aspect: 1.25, pad: 0.11 } as const;
}

const BODY: Box3 = { x: 8, y: 24, z: 0, w: 152, d: 70, h: 12 };
const PRISM: Box3 = { x: 24, y: 36, z: 12, w: 32, d: 32, h: 18 };
const FIBERS = 8;

function fiber(i: number): Box3 {
  return { x: 70 + i * 10, y: 40, z: 12, w: 6, d: 36, h: 6 };
}

export default function OpticalInterconnectTransceiver() {
  const [locked, setLocked] = useState(false);

  const align = () => {
    setLocked((was) => {
      const next = !was;
      if (next) playSound("cascade", { count: 8, stagger: 0.05 });
      else playSound("whoosh");
      return next;
    });
  };

  return (
    <Plate
      label="Co-packaged silicon photonics module"
      fit={[
        BODY,
        PRISM,
        shift(PRISM, -22, -8, 8),
        ...Array.from({ length: FIBERS }, (_, i) => fiber(i)),
      ]}
      readout={
        locked
          ? "800G DR8 · 1310nm LOCKED"
          : "prism free · wavelength open"
      }
      {...plateProps("Fig. 16", "800G optics", "press the prism")}
    >
      <Box
        {...BODY}
        r={3}
        top={<path className="ik-detail" d="M 12 12 h 128" />}
      />
      {Array.from({ length: FIBERS }, (_, i) => (
        <g
          key={i}
          style={isoMove(0, locked ? 0 : 6, locked ? 2 : 0, i)}
        >
          <Box
            {...fiber(i)}
            r={1}
            top={
              locked && i === 3 ? (
                <LiveMark x={1} y={6} w={4} />
              ) : (
                <path className="ik-detail" d="M 1 4 h 4" />
              )
            }
          />
        </g>
      ))}
      <Press
        label={
          locked
            ? "Release the coupling prism"
            : "Align the coupling prism"
        }
        material="glass"
        onPress={align}
      >
        <g>
          <g
            style={isoMove(
              locked ? 0 : -22,
              locked ? 0 : -8,
              locked ? 0 : 8
            )}
          >
            <Box
              {...PRISM}
              r={2}
              top={
                <g>
                  <path
                    className="ik-detail"
                    d="M 4 16 L 16 4 L 28 16"
                  />
                  {!locked && <LiveMark x={6} y={20} w={20} />}
                </g>
              }
              front={
                <path
                  className="ik-detail"
                  d="M 4 4 L 16 14 L 28 4"
                />
              }
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
