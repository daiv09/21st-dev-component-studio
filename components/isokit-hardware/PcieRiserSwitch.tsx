"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, Screen, isoMove, plateProps } from "./kit";

const FOOT: Box3 = { x: 16, y: 46, z: 0, w: 128, d: 40, h: 8 };
const CARD: Box3 = { x: 28, y: 52, z: 8, w: 104, d: 12, h: 78 };
const CLIP: Box3 = { x: 36, y: 46, z: 70, w: 24, d: 18, h: 8 };
const MODES = ["x16", "x8/x8", "x4/x4/x4/x4"];

function lane(i: number): Box3 {
  return { x: 36 + i * 18, y: 48, z: 28, w: 14, d: 16, h: 10 };
}

export default function PcieRiserSwitch() {
  const [mode, setMode] = useState(0);

  const cycle = () => {
    setMode((n) => (n + 1) % MODES.length);
    playSound("tick");
  };

  const spread = mode * 4;

  return (
    <Plate
      label="PCIe Gen 5 x16 bifurcation riser"
      fit={[FOOT, CARD, CLIP, ...[0, 1, 2, 3].map((i) => ({ ...lane(i), x: lane(i).x + i * 8 }))]}
      readout={mode === 0 ? "bifurcation · x16" : `lanes · ${MODES[mode]}`}
      {...plateProps("Fig. 09", "PCIe riser", "press the clip")}
    >
      <Box {...FOOT} r={3} top={<Screen x={8} y={8} w={80} h={24} kicker="gen5" line={MODES[mode]} lit={mode > 0} />} />
      <Box
        {...CARD}
        r={2}
        front={
          <g>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <path key={n} className="ik-detail" d={`M 8 ${12 + n * 10} h 88`} />
            ))}
          </g>
        }
      />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} style={isoMove(i * spread - spread, 0, 0, i)}>
          <Box {...lane(i)} r={1} top={<rect className="ik-fill" x={2} y={3} width={10} height={10} />} />
        </g>
      ))}
      <Press label="Cycle PCIe bifurcation" material="metal" onPress={cycle}>
        <g>
          <g style={isoMove(0, mode === 0 ? 0 : 8, mode === 0 ? 0 : 4)}>
            <Box
              {...CLIP}
              r={2}
              top={<LiveMark x={3} y={5} w={18} />}
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
