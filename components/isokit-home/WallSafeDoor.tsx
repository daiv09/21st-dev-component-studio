"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, isoMove, plateProps, shift } from "./kit";

const VAULT: Box3 = { x: 24, y: 20, z: 0, w: 120, d: 88, h: 56 };
const DOOR: Box3 = { x: 32, y: 28, z: 8, w: 104, d: 8, h: 48 };
const INNER: Box3 = { x: 40, y: 36, z: 16, w: 88, d: 40, h: 8 };
const SLIDE = 36;

export default function WallSafeDoor() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((was) => {
      playSound(was ? "latch" : "motor");
      return !was;
    });
  };

  return (
    <Plate
      label="In-wall safe with sliding door"
      fit={[VAULT, DOOR, INNER, shift(DOOR, SLIDE, 0, 0), shift(INNER, SLIDE - 8, 0, 0)]}
      readout={open ? "safe open · documents" : "safe shut · locked"}
      {...plateProps("Home 11", "Wall safe", "press the door")}
    >
      <Box {...VAULT} r={2} />
      <Press label={open ? "Shut the wall safe" : "Slide the safe door open"} material="metal" onPress={toggle}>
        <g>
          <g style={isoMove(open ? SLIDE : 0, 0, 0)}>
            <Box {...DOOR} r={1} front={open ? <LiveMark x={8} y={4} w={88} /> : <path className="ik-detail" d="M 8 4 h 88" />} />
            <Box {...INNER} r={1} top={<rect className="ik-well" x={8} y={8} width={72} height={24} rx={1} />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
