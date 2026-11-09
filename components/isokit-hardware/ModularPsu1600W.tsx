"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, Screen, Vents, isoMove, plateProps, shift } from "./kit";

const BRICK: Box3 = { x: 8, y: 16, z: 0, w: 150, d: 78, h: 36 };
const ROCKER: Box3 = { x: 18, y: 78, z: 12, w: 22, d: 14, h: 10 };
const LOADS = [0, 480, 960, 1420];

function rail(i: number): Box3 {
  return { x: 58 + i * 28, y: 28, z: 36, w: 22, d: 36, h: 8 };
}

export default function ModularPsu1600W() {
  const [step, setStep] = useState(0);
  const watts = LOADS[step];

  const cycle = () => {
    setStep((n) => (n + 1) % LOADS.length);
    playSound("relay");
    window.setTimeout(() => playSound(step === LOADS.length - 1 ? "latch" : "tick"), 90);
  };

  return (
    <Plate
      label="1600W titanium server power supply"
      fit={[BRICK, ROCKER, shift(ROCKER, 0, 6, 3), ...[0, 1, 2].flatMap((i) => [rail(i), shift(rail(i), 0, 0, 10)])]}
      readout={watts === 0 ? "breaker open · 0W" : `RAIL 12V · ${watts}W LOAD`}
      {...plateProps("Fig. 08", "1600W PSU", "press the breaker")}
    >
      <Box
        {...BRICK}
        r={4}
        front={<Screen x={52} y={6} w={86} h={24} kicker="12V rail" line={watts === 0 ? "open" : `${watts}W`} lit={watts > 0} />}
        side={<Vents x={10} y={8} count={5} gap={5} length={58} />}
        top={<Vents x={16} y={10} count={4} gap={14} length={118} />}
      />
      {[0, 1, 2].map((i) => (
        <g key={i} style={isoMove(0, 0, step > i ? 6 : 0, i)}>
          <Box {...rail(i)} r={2} top={<text className="ik-label" x={4} y={20} style={{ fontSize: 5 }}>{`${i + 1}`}</text>} />
        </g>
      ))}
      <Press label={watts === 0 ? "Close the PSU breaker" : "Step the 12V load"} material="plastic" onPress={cycle}>
        <g>
          <g style={isoMove(0, step > 0 ? 5 : 0, step > 0 ? 2 : 0)}>
            <Box
              {...ROCKER}
              r={2}
              top={<LiveMark x={3} y={4} w={16} />}
              front={<text className="ik-label" x={3} y={8} style={{ fontSize: 4 }}>I/O</text>}
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
