"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Glow, isoMove, plateProps, shift } from "./kit";

const BASE: Box3 = { x: 48, y: 56, z: 0, w: 72, d: 48, h: 6 };
const POLE: Box3 = { x: 72, y: 64, z: 6, w: 24, d: 24, h: 32 };
const ARM_A: Box3 = { x: 78, y: 48, z: 38, w: 48, d: 14, h: 8 };
const ARM_B: Box3 = { x: 118, y: 42, z: 42, w: 36, d: 12, h: 6 };
const SHADE: Box3 = { x: 146, y: 36, z: 44, w: 28, d: 28, h: 14 };
const EXT = 28;

export default function DeskLampTelescope() {
  const [reach, setReach] = useState(false);

  const extend = () => {
    setReach((was) => {
      playSound(was ? "latch" : "tick");
      return !was;
    });
  };

  return (
    <Plate
      label="Desk lamp with telescoping arm"
      fit={[BASE, POLE, ARM_A, ARM_B, SHADE, shift(ARM_B, EXT, -6, 0), shift(SHADE, EXT + 20, -10, 2)]}
      readout={reach ? "arm out · pool of light" : "arm in · desk center"}
      {...plateProps("Home 13", "Desk lamp", "press the shade")}
    >
      <Box {...BASE} r={3} />
      <Box {...POLE} r={4} />
      <Box {...ARM_A} r={2} />
      <Press label={reach ? "Retract the lamp arm" : "Extend the lamp arm"} material="metal" onPress={extend}>
        <g>
          <g style={isoMove(reach ? EXT : 0, reach ? -6 : 0, reach ? 2 : 0)}>
            <Box {...ARM_B} r={2} />
            <Box
              {...SHADE}
              r={6}
              top={
                <Glow on={reach}>
                  <path className="ik-live" d="M 6 10 h 16" />
                </Glow>
              }
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
