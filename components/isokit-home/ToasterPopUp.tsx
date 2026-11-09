"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, isoMove, plateProps, shift } from "./kit";

const BASE: Box3 = { x: 8, y: 20, z: 0, w: 148, d: 86, h: 10 };
const BODY: Box3 = { x: 24, y: 32, z: 10, w: 116, d: 62, h: 48 };
const SLOT: Box3 = { x: 44, y: 40, z: 58, w: 76, d: 46, h: 6 };
const BREAD: Box3 = { x: 52, y: 46, z: 14, w: 60, d: 34, h: 44 };
const POP = 52;

export default function ToasterPopUp() {
  const [up, setUp] = useState(false);

  const toast = () => {
    setUp((was) => {
      const next = !was;
      playSound(next ? "relay" : "latch");
      if (next) window.setTimeout(() => playSound("success"), 420);
      return next;
    });
  };

  return (
    <Plate
      label="Countertop toaster"
      fit={[BASE, BODY, SLOT, BREAD, shift(BREAD, 0, 0, POP)]}
      readout={up ? "slice up · golden" : "idle · slot cold"}
      {...plateProps("Home 01", "Toaster", "press the lever")}
    >
      <Box {...BASE} r={4} />
      <Box {...BODY} r={6} side={<path className="ik-detail" d="M 8 10 h 46 M 8 22 h 46" />} />
      <Box {...SLOT} r={2} top={<rect className="ik-well" x={6} y={6} width={64} height={34} rx={2} />} />
      <Press label={up ? "Lower the toast" : "Pop the toast"} material="metal" onPress={toast}>
        <g>
          <g style={isoMove(0, 0, up ? POP : 0, 0, up ? "var(--ik-ease-fall)" : "var(--ik-ease-move)")}>
            <Box {...BREAD} r={3} top={up ? <LiveMark x={8} y={8} w={44} /> : <path className="ik-detail" d="M 8 12 h 44" />} />
          </g>
          <Box x={18} y={78} z={10} w={28} d={18} h={8} r={2} top={<LiveMark x={4} y={4} w={20} />} />
        </g>
      </Press>
    </Plate>
  );
}
