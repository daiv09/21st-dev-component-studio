"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Glow, LiveMark, isoMove, plateProps } from "./kit";

const PLATE: Box3 = { x: 24, y: 16, z: 0, w: 120, d: 96, h: 6 };
const ROCKER: Box3 = { x: 58, y: 36, z: 6, w: 52, d: 36, h: 10 };
const TRAVEL = 14;

export default function WallLightSwitch() {
  const [on, setOn] = useState(false);

  const flip = () => {
    setOn((was) => {
      playSound("relay");
      window.setTimeout(() => playSound(!was ? "success" : "tick"), 80);
      return !was;
    });
  };

  return (
    <Plate
      label="Wall light switch plate"
      fit={[PLATE, ROCKER, { ...ROCKER, y: ROCKER.y + TRAVEL }]}
      readout={on ? "circuit on · warm glow" : "circuit off · dark room"}
      {...plateProps("Home 03", "Light switch", "press the rocker")}
    >
      <Box {...PLATE} r={3} front={<Glow on={on}><circle cx={24} cy={48} r={3} className={on ? "ik-dot" : "ik-fill"} /></Glow>} />
      <Press label={on ? "Turn the light off" : "Turn the light on"} material="plastic" onPress={flip}>
        <g>
          <g style={isoMove(0, on ? TRAVEL : 0, 0, 0, "var(--ik-t-state)")}>
            <Box {...ROCKER} r={2} top={on ? <LiveMark x={6} y={8} w={40} /> : <path className="ik-detail" d="M 6 8 h 40" />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
