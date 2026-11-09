"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { isoMove, plateProps, shift } from "./kit";

const CAN: Box3 = { x: 40, y: 32, z: 0, w: 88, d: 64, h: 52 };
const LID: Box3 = { x: 44, y: 36, z: 52, w: 80, d: 56, h: 6 };
const PEDAL: Box3 = { x: 24, y: 88, z: 0, w: 32, d: 20, h: 8 };
const LIFT = 38;
const PEDAL_Y = 10;

export default function TrashCanPedal() {
  const [open, setOpen] = useState(false);

  const step = () => {
    setOpen((was) => {
      const next = !was;
      playSound("relay");
      window.setTimeout(() => playSound(next ? "latch" : "tick"), 90);
      return next;
    });
  };

  return (
    <Plate
      label="Pedal-lid kitchen trash can"
      fit={[CAN, LID, shift(LID, 0, -8, LIFT), PEDAL, shift(PEDAL, 0, PEDAL_Y, 0)]}
      readout={open ? "lid up · toss scrap" : "lid down · sealed"}
      {...plateProps("Home 18", "Trash can", "press the pedal")}
    >
      <Box {...CAN} r={4} top={<rect className="ik-well" x={8} y={8} width={64} height={40} rx={3} />} />
      <g style={isoMove(0, 0, open ? LIFT : 0, 0, "var(--ik-ease-move)")}>
        <g style={isoMove(0, open ? -8 : 0, 0)}>
          <Box {...LID} r={3} />
        </g>
      </g>
      <Press label={open ? "Release the trash pedal" : "Step the trash pedal"} material="metal" onPress={step}>
        <g>
          <g style={isoMove(0, open ? PEDAL_Y : 0, 0)}>
            <Box {...PEDAL} r={2} top={<path className="ik-live" d="M 4 4 h 24" />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
