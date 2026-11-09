"use client";

import { useState, type ReactNode } from "react";
import { Box, Plate, Press, Glow, playSound, type Box3 } from "react-isokit";

const wrap = (node: ReactNode) => (
  <div className="w-full max-w-md mx-auto">{node}</div>
);

export function Toaster() {
  const [slots, setSlots] = useState(0);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 100, d: 56, h: 10 };
  const body: Box3 = { x: 8, y: 8, z: 10, w: 84, d: 40, h: 36 };
  const lever: Box3 = { x: 78, y: 18, z: 22, w: 10, d: 20, h: 16 };
  return wrap(
    <Plate label="Toaster" fit={[base, body, lever]} fig="Fig. 06" name="2-Slice" hint="pull lever" readout={`cycle ${slots} · ${slots % 2 ? "toasting" : "ready"}`}>
      <Box {...base} r={4} />
      <Box {...body} r={5} front={<rect x={10} y={8} width={50} height={20} rx={2} className="ik-well" />} />
      <Press
        label="Toast lever"
        material="metal"
        onPress={() => {
          playSound("latch");
          setSlots((s) => s + 1);
        }}
      >
        <g>
          <Box {...lever} r={3} />
        </g>
      </Press>
    </Plate>
  );
}

export function Kettle() {
  const [boil, setBoil] = useState(false);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 72, d: 72, h: 8 };
  const pot: Box3 = { x: 10, y: 10, z: 8, w: 52, d: 52, h: 40 };
  const spout: Box3 = { x: 48, y: 36, z: 28, w: 22, d: 14, h: 10 };
  return wrap(
    <Plate label="Kettle" fit={[base, pot, spout]} fig="Fig. 07" name="Stovetop" hint="tap body" readout={boil ? "boiling · 100°c" : "cold · off"}>
      <Box {...base} r={6} />
      <Press
        label="Boil kettle"
        material="metal"
        onPress={() => {
          playSound("relay");
          setBoil((b) => !b);
        }}
      >
        <g>
          <Box
            {...pot}
            r={8}
            front={
              <Glow on={boil}>
                <text className="ik-screen-text" x={12} y={24} style={{ fontSize: 6 }}>
                  {boil ? "100°" : "20°"}
                </text>
              </Glow>
            }
          />
        </g>
      </Press>
      <Box {...spout} r={3} />
    </Plate>
  );
}

export function Microwave() {
  const [sec, setSec] = useState(0);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 110, d: 80, h: 8 };
  const body: Box3 = { x: 6, y: 6, z: 8, w: 98, d: 68, h: 52 };
  const door: Box3 = { x: 14, y: 14, z: 16, w: 58, d: 52, h: 6 };
  return wrap(
    <Plate label="Microwave" fit={[base, body, door]} fig="Fig. 08" name="Counter MW" hint="add 30 sec" readout={`timer ${sec}s`}>
      <Box {...base} r={4} />
      <Box {...body} r={5} side={<rect x={8} y={10} width={12} height={30} rx={2} className="ik-well" />} />
      <Press
        label="Add thirty seconds"
        material="glass"
        onPress={() => {
          playSound("beep");
          setSec((s) => s + 30);
        }}
      >
        <g>
          <Box
            {...door}
            r={3}
            front={
              <text x={door.w / 2} y={door.h / 2 + 2} textAnchor="middle" className="ik-label" style={{ fontSize: 5 }}>
                +30
              </text>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}

export function DeskFan() {
  const [speed, setSpeed] = useState(0);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 64, d: 64, h: 8 };
  const pole: Box3 = { x: 26, y: 26, z: 8, w: 12, d: 12, h: 38 };
  const cage: Box3 = { x: 8, y: 8, z: 46, w: 48, d: 48, h: 8 };
  const labels = ["off", "low", "med", "high"];
  return wrap(
    <Plate label="Desk fan" fit={[base, pole, cage]} fig="Fig. 09" name="Oscillator" hint="cycle speed" readout={`speed · ${labels[speed]}`}>
      <Box {...base} r={6} />
      <Box {...pole} r={2} />
      <Press
        label="Cycle fan speed"
        material="plastic"
        onPress={() => {
          playSound("tick");
          setSpeed((s) => (s + 1) % 4);
        }}
      >
        <g>
          <Box
            {...cage}
            r={20}
            top={
              <g className={speed > 0 ? "ik-loop" : undefined}>
                <circle cx={cage.w / 2} cy={cage.d / 2} r={14} className="ik-detail" />
                <path d={`M ${cage.w / 2} ${cage.d / 2} L ${cage.w / 2 + 12} ${cage.d / 2 - 6}`} className={speed > 0 ? "ik-live" : "ik-detail"} />
              </g>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}
