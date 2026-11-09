"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, isoMove, plateProps } from "./kit";

const BASE: Box3 = { x: 20, y: 28, z: 0, w: 128, d: 72, h: 8 };
const PAD: Box3 = { x: 36, y: 40, z: 8, w: 96, d: 48, h: 6 };
const STAMP: Box3 = { x: 62, y: 52, z: 14, w: 44, d: 28, h: 22 };
const DOWN = 10;

export default function InkStampPad() {
  const [pressed, setPressed] = useState(false);
  const [count, setCount] = useState(0);

  const stamp = () => {
    setPressed(true);
    playSound("paper");
    window.setTimeout(() => {
      setPressed(false);
      setCount((n) => n + 1);
      playSound("success");
    }, 260);
  };

  return (
    <Plate
      label="Rubber stamp and ink pad"
      fit={[BASE, PAD, STAMP, { ...STAMP, z: STAMP.z - DOWN }]}
      readout={count === 0 ? "ready · lift stamp" : `stamped · ${count} marks`}
      {...plateProps("Home 04", "Stamp pad", "press the stamp")}
    >
      <Box {...BASE} r={4} />
      <Box {...PAD} r={3} top={<rect className="ik-well" x={8} y={8} width={80} height={32} rx={2} />} />
      <Press label="Press the rubber stamp" material="rubber" onPress={stamp}>
        <g>
          <g style={isoMove(0, 0, pressed ? -DOWN : 0, 0, "var(--ik-ease-fall)")}>
            <Box {...STAMP} r={2} top={<text className="ik-label" x={8} y={16} style={{ fontSize: 6 }}>PAID</text>} front={pressed ? <LiveMark x={6} y={4} w={32} /> : undefined} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
