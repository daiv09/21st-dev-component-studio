"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Screen, isoMove, plateProps, shift } from "./kit";

const BASE: Box3 = { x: 28, y: 32, z: 0, w: 112, d: 72, h: 10 };
const BODY: Box3 = { x: 40, y: 40, z: 10, w: 88, d: 56, h: 42 };
const LID: Box3 = { x: 44, y: 44, z: 52, w: 80, d: 48, h: 6 };
const CAP: Box3 = { x: 72, y: 48, z: 58, w: 24, d: 20, h: 12 };
const LIFT = 16;

export default function KettleLid() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((was) => {
      playSound(was ? "latch" : "tick");
      return !was;
    });
  };

  return (
    <Plate
      label="Electric kettle with hinged lid"
      fit={[BASE, BODY, LID, CAP, shift(LID, 0, 0, LIFT), shift(CAP, 0, 0, LIFT + 8)]}
      readout={open ? "lid up · 98°C hold" : "lid down · boiling"}
      {...plateProps("Home 06", "Kettle", "press the lid")}
    >
      <Box {...BASE} r={4} />
      <Box {...BODY} r={8} front={<Screen x={8} y={8} w={72} h={22} kicker="temp" line={open ? "98 C" : "100 C"} lit={!open} />} />
      <Press label={open ? "Seat the kettle lid" : "Lift the kettle lid"} material="metal" onPress={toggle}>
        <g>
          <g style={isoMove(0, 0, open ? LIFT : 0)}>
            <Box {...LID} r={6} />
            <Box {...CAP} r={3} top={<path className="ik-detail" d="M 4 6 h 16" />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
