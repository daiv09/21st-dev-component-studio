"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, Screen, isoMove, plateProps, shift } from "./kit";

const DECK: Box3 = { x: 20, y: 78, z: 0, w: 120, d: 36, h: 12 };
const STAGES = ["300K", "4K", "15mK · 127 QUBITS COHERENT"];
const KNOB: Box3 = { x: 70, y: 46, z: 80, w: 20, d: 16, h: 8 };
const PLATES: Box3[] = [
  { x: 18, y: 16, z: 16, w: 124, d: 78, h: 6 },
  { x: 30, y: 26, z: 36, w: 100, d: 58, h: 6 },
  { x: 42, y: 34, z: 56, w: 76, d: 42, h: 5 },
  { x: 52, y: 40, z: 74, w: 56, d: 30, h: 5 },
];

function rod(i: number): Box3 {
  const spots = [
    { x: 22, y: 20 },
    { x: 128, y: 20 },
    { x: 22, y: 80 },
    { x: 128, y: 80 },
  ];
  return { x: spots[i].x, y: spots[i].y, z: 12, w: 6, d: 6, h: 112 };
}

export default function QuantumCryoDilution() {
  const [stage, setStage] = useState(0);

  const step = () => {
    setStage((n) => (n + 1) % STAGES.length);
    playSound("cascade", { count: 4, stagger: 0.08 });
  };

  return (
    <Plate
      label="Quantum dilution refrigerator"
      fit={[DECK, KNOB, shift(KNOB, 0, 0, 30), ...[0, 1, 2, 3].map(rod), ...PLATES.flatMap((plate, i) => [plate, shift(plate, 0, 0, stageMax(i))])]}
      readout={stage === 2 ? "15mK · 127 QUBITS COHERENT" : `stage · ${STAGES[stage]}`}
      {...plateProps("Fig. 10", "Dilution stage", "press the cold head")}
    >
      {[0, 1, 2, 3].map((i) => (
        <Box key={`rod-${i}`} {...rod(i)} r={2} />
      ))}
      {PLATES.map((plate, i) => (
        <g key={i} style={isoMove(0, 0, stage * i * 5, i)}>
          <Box {...plate} r={2} top={<path className="ik-detail" d={`M 8 ${plate.d / 2} h ${plate.w - 16}`} />} />
        </g>
      ))}
      <Box
        {...DECK}
        r={3}
        top={<Screen x={8} y={6} w={104} h={24} kicker="cryo" line={stage === 0 ? "300K" : stage === 1 ? "4K" : "15 mK"} lit={stage > 0} />}
      />
      <Press label="Step the dilution stage colder" material="metal" onPress={step}>
        <g>
          <g style={isoMove(0, 0, stage * 3 * 5)}>
            <Box {...KNOB} r={3} top={<LiveMark x={3} y={5} w={14} />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}

function stageMax(i: number) {
  return 2 * i * 5;
}
