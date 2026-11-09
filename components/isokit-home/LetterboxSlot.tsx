"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { isoMove, plateProps, shift } from "./kit";

const WALL: Box3 = { x: 0, y: 8, z: 0, w: 168, d: 108, h: 8 };
const SLOT: Box3 = { x: 48, y: 24, z: 8, w: 72, d: 8, h: 48 };
const FLAP: Box3 = { x: 52, y: 28, z: 56, w: 64, d: 6, h: 28 };
const OPEN = 22;

export default function LetterboxSlot() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((was) => {
      playSound(was ? "latch" : "whoosh");
      return !was;
    });
  };

  return (
    <Plate
      label="Front door letter slot"
      fit={[WALL, SLOT, FLAP, shift(FLAP, 0, -OPEN, -18)]}
      readout={open ? "flap open · mail in" : "flap shut · no post"}
      {...plateProps("Home 05", "Letter slot", "press the flap")}
    >
      <Box {...WALL} r={2} />
      <Box {...SLOT} r={1} />
      <Press label={open ? "Close the letter flap" : "Open the letter flap"} material="metal" onPress={toggle}>
        <g>
          <g style={isoMove(0, open ? -OPEN : 0, open ? -18 : 0)}>
            <Box {...FLAP} r={1} front={<path className="ik-detail" d="M 6 4 h 52" />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
