"use client";

import { useState } from "react";
import { Box, Plate, Press, curve, path, playSound, type Box3 } from "react-isokit";
import { LiveMark, Rotor, isoMove, plateProps, shift, useMotor } from "./kit";

const DECK: Box3 = { x: 0, y: 20, z: 0, w: 160, d: 96, h: 8 };
const BLOCK: Box3 = { x: 18, y: 36, z: 8, w: 70, d: 58, h: 36 };
const PUMP: Box3 = { x: 96, y: 40, z: 8, w: 48, d: 48, h: 22 };
const CAP: Box3 = { x: 104, y: 48, z: 30, w: 32, d: 32, h: 8 };
const STAGES = [
  { rpm: "1200 RPM", line: "TEMP 34°C · FLOW 4.2 L/M", level: 0.34 },
  { rpm: "3200 RPM", line: "TEMP 31°C · FLOW 6.8 L/M", level: 0.62 },
  { rpm: "4800 RPM", line: "TEMP 28°C · FLOW 9.1 L/M", level: 0.88 },
];

const TUBE_A = curve([46, 40, 40], [20, 18, 58], [70, 8, 48], [112, 48, 36], 18);
const TUBE_B = curve([70, 70, 28], [150, 90, 40], [150, 40, 22], [128, 52, 16], 18);

export default function LiquidCoolingManifold() {
  const [stage, setStage] = useState(0);
  const motor = useMotor();
  const current = STAGES[stage];
  const spinning = stage > 0;

  const cycle = () => {
    setStage((n) => (n + 1) % STAGES.length);
    motor.start(0.7);
    playSound("tick");
  };

  const fillH = 8 + current.level * 16;

  return (
    <Plate
      label="Custom loop pump and distribution plate"
      fit={[DECK, BLOCK, PUMP, CAP, shift(CAP, 0, 0, 4), [20, 8, 58] as const, [150, 90, 48] as const]}
      readout={`${current.rpm} · ${current.line}`}
      {...plateProps("Fig. 06", "Coolant loop", "press the pump")}
    >
      <Box {...DECK} r={4} />
      <path className="ik-line" d={path(TUBE_A)} />
      <path className="ik-line" d={path(TUBE_B)} />
      <Box
        {...BLOCK}
        r={4}
        front={
          <g>
            <rect className="ik-well" x={8} y={6} width={BLOCK.w - 16} height={24} rx={2} />
            <rect
              className="ik-fill"
              x={10}
              y={28 - fillH}
              width={BLOCK.w - 20}
              height={fillH}
              style={{ transition: "y var(--ik-t-move) var(--ik-ease), height var(--ik-t-move) var(--ik-ease)" }}
            />
          </g>
        }
        top={<text className="ik-label" x={12} y={18} style={{ fontSize: 6 }}>RES</text>}
      />
      <Box {...PUMP} r={6} />
      <Press label="Cycle the coolant pump" material="metal" onPress={cycle}>
        <g>
          <g style={isoMove(0, 0, spinning ? 4 : 0)}>
            <Box
              {...CAP}
              r={8}
              top={
                <g>
                  <Rotor cx={16} cy={16} r={11} spin={spinning} />
                  <LiveMark x={4} y={4} w={24} />
                </g>
              }
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
