"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Glow, isoMove, plateProps, shift } from "./kit";

const BODY: Box3 = { x: 12, y: 18, z: 0, w: 144, d: 86, h: 52 };
const DOOR: Box3 = { x: 20, y: 26, z: 8, w: 128, d: 8, h: 44 };
const TRAY: Box3 = { x: 36, y: 34, z: 16, w: 96, d: 48, h: 6 };
const OPEN_Y = 28;

export default function MicrowaveDoor() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((was) => {
      playSound(was ? "latch" : "motor");
      return !was;
    });
  };

  return (
    <Plate
      label="Microwave with sliding door panel"
      fit={[BODY, DOOR, TRAY, shift(DOOR, 0, OPEN_Y, 0), shift(TRAY, 0, OPEN_Y - 8, 4)]}
      readout={open ? "door open · plate ready" : "door shut · 0:45 left"}
      {...plateProps("Home 09", "Microwave", "press the door")}
    >
      <Box {...BODY} r={4} front={<Glow on={!open}><rect x={14} y={10} width={72} height={24} rx={2} className="ik-screen" /></Glow>} />
      <Press label={open ? "Shut the microwave door" : "Slide the microwave door open"} material="glass" onPress={toggle}>
        <g>
          <g style={isoMove(0, open ? OPEN_Y : 0, open ? 4 : 0)}>
            <Box {...DOOR} r={2} front={<path className="ik-detail" d="M 8 4 h 112" />} />
            <Box {...TRAY} r={2} top={<rect className="ik-well" x={12} y={8} width={72} height={32} rx={2} />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
