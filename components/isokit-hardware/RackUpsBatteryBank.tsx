"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, Screen, isoMove, plateProps } from "./kit";

const TRAY: Box3 = { x: 4, y: 18, z: 0, w: 160, d: 78, h: 22 };
const BEZEL: Box3 = { x: 12, y: 84, z: 6, w: 144, d: 16, h: 28 };
const CELLS = 6;

function cell(i: number): Box3 {
  return { x: 16 + i * 24, y: 30, z: 22, w: 18, d: 40, h: 14 };
}

export default function RackUpsBatteryBank() {
  const [battery, setBattery] = useState(false);

  const cutover = () => {
    setBattery((on) => !on);
    playSound("relay");
    window.setTimeout(() => playSound(battery ? "success" : "notify"), 120);
  };

  return (
    <Plate
      label="2U lithium rackmount UPS"
      fit={[TRAY, BEZEL, ...Array.from({ length: CELLS }, (_, i) => cell(i))]}
      readout={battery ? "ON BATTERY · 94% · 42 MIN" : "mains · float charge"}
      {...plateProps("Fig. 12", "Rack UPS", "press the bezel")}
    >
      <Box {...TRAY} r={3} side={<path className="ik-detail" d="M 10 6 h 58 M 10 12 h 58" />} />
      {Array.from({ length: CELLS }, (_, i) => (
        <g key={i} style={isoMove(0, 0, battery ? -3 : 0, i, "var(--ik-ease-fall)")}>
          <Box {...cell(i)} r={2} top={<rect className={battery ? "ik-fill" : "ik-well"} x={3} y={6} width={12} height={28} rx={1} />} />
        </g>
      ))}
      <Press label={battery ? "Restore UPS mains" : "Cut over to battery"} material="plastic" onPress={cutover}>
        <g>
          <g style={isoMove(0, battery ? 8 : 0, 0)}>
            <Box
              {...BEZEL}
              r={3}
              front={
                <g>
                  <Screen x={8} y={3} w={96} h={22} kicker="ups" line={battery ? "94% · 42m" : "mains"} lit={battery} />
                  <LiveMark x={108} y={8} w={24} />
                </g>
              }
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
