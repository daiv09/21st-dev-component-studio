"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { isoMove, plateProps, shift } from "./kit";

const BOTTLE: Box3 = { x: 52, y: 28, z: 0, w: 64, d: 64, h: 72 };
const NECK: Box3 = { x: 68, y: 44, z: 72, w: 32, d: 32, h: 24 };
const PUMP: Box3 = { x: 72, y: 48, z: 96, w: 24, d: 24, h: 18 };
const STROKE = 14;

export default function SoapDispenserPump() {
  const [down, setDown] = useState(false);
  const [doses, setDoses] = useState(0);

  const pump = () => {
    if (down) return;
    setDown(true);
    playSound("tick");
    window.setTimeout(() => {
      setDown(false);
      setDoses((n) => n + 1);
      playSound("success");
    }, 220);
  };

  return (
    <Plate
      label="Counter soap pump bottle"
      fit={[BOTTLE, NECK, PUMP, shift(PUMP, 0, 0, -STROKE)]}
      readout={doses === 0 ? "pump once · foam ready" : `dispensed · ${doses} pumps`}
      {...plateProps("Home 14", "Soap pump", "press the pump")}
    >
      <Box {...BOTTLE} r={8} front={<path className="ik-detail" d="M 8 12 h 48 M 8 24 h 48" />} />
      <Box {...NECK} r={4} />
      <Press label="Press the soap pump head" material="plastic" onPress={pump}>
        <g>
          <g style={isoMove(0, 0, down ? -STROKE : 0, 0, "var(--ik-ease-fall)")}>
            <Box {...PUMP} r={3} top={<rect className="ik-well" x={4} y={4} width={16} height={12} rx={2} />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
