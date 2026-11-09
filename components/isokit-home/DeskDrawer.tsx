"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Screen, isoMove, plateProps, shift, useMotor } from "./kit";

const TOP: Box3 = { x: 0, y: 12, z: 36, w: 160, d: 96, h: 8 };
const LEGS: Box3 = { x: 8, y: 20, z: 0, w: 144, d: 80, h: 36 };
const DRAWER: Box3 = { x: 28, y: 28, z: 8, w: 104, d: 58, h: 10 };
const PULL = 38;

export default function DeskDrawer() {
  const [open, setOpen] = useState(false);
  const motor = useMotor();

  const toggle = () => {
    setOpen((was) => {
      const next = !was;
      motor.start(0.6);
      playSound(next ? "motor" : "latch");
      return next;
    });
  };

  return (
    <Plate
      label="Writing desk with drawer"
      fit={[LEGS, TOP, DRAWER, shift(DRAWER, 0, PULL, 0)]}
      readout={open ? "drawer out · pens inside" : "drawer seated · latched"}
      {...plateProps("Home 02", "Desk drawer", "press the pull")}
    >
      <Box {...LEGS} r={3} top={<Screen x={8} y={48} w={88} h={24} kicker="desk" line={open ? "open" : "shut"} lit={open} />} />
      <Box {...TOP} r={4} />
      <Press label={open ? "Close the desk drawer" : "Open the desk drawer"} material="metal" onPress={toggle}>
        <g>
          <g style={isoMove(0, open ? PULL : 0, 0)}>
            <Box {...DRAWER} r={3} front={<rect className="ik-well" x={8} y={2} width={88} height={6} rx={1} />} top={<path className="ik-detail" d="M 12 10 h 80" />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
