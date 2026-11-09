"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Screen, isoMove, plateProps, shift } from "./kit";

const BASE: Box3 = { x: 36, y: 48, z: 0, w: 96, d: 58, h: 8 };
const LOWER: Box3 = { x: 44, y: 52, z: 8, w: 80, d: 48, h: 22 };
const UPPER: Box3 = { x: 48, y: 44, z: 30, w: 72, d: 40, h: 8 };
const LID_SCREEN: Box3 = { x: 52, y: 48, z: 38, w: 64, d: 28, h: 4 };
const OPEN_Z = 28;

export default function FlipPhoneClamshell() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((was) => {
      playSound(was ? "latch" : "tick");
      return !was;
    });
  };

  return (
    <Plate
      label="Clamshell flip phone"
      fit={[BASE, LOWER, UPPER, LID_SCREEN, shift(UPPER, 0, -12, OPEN_Z), shift(LID_SCREEN, 0, -12, OPEN_Z + 4)]}
      readout={open ? "flip open · dial ready" : "flip closed · standby"}
      {...plateProps("Home 12", "Flip phone", "press the lid")}
    >
      <Box {...BASE} r={3} />
      <Box {...LOWER} r={4} top={<g>{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}-${c}`} className="ik-well" x={8 + c * 18} y={8 + r * 10} width={12} height={6} rx={1} />))}</g>} />
      <Press label={open ? "Close the flip phone" : "Open the flip phone"} material="plastic" className="ik-lift" onPress={toggle}>
        <g>
          <g style={isoMove(0, open ? -12 : 0, open ? OPEN_Z : 0)}>
            <Box {...UPPER} r={4} />
            <Box {...LID_SCREEN} r={2} front={<Screen x={4} y={2} w={56} h={18} kicker="gsm" line={open ? "ready" : "off"} lit={open} />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
