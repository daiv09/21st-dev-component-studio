"use client";

import { useState, type ReactNode } from "react";
import { Box, Plate, Press, Glow, playSound, type Box3 } from "react-isokit";

const wrap = (node: ReactNode) => (
  <div className="w-full max-w-md mx-auto">{node}</div>
);

export function LightSwitch() {
  const [on, setOn] = useState(false);
  const plate: Box3 = { x: 0, y: 0, z: 0, w: 48, d: 72, h: 8 };
  const toggle: Box3 = { x: 8, y: 10, z: 8, w: 32, d: 52, h: 10 };
  return wrap(
    <Plate label="Light switch" fit={[plate, toggle]} fig="Fig. 02" name="Wall Switch" hint="flip toggle" readout={on ? "on · lit" : "off · dark"}>
      <Box {...plate} r={4} />
      <Press
        label="Toggle light"
        material="plastic"
        onPress={() => {
          playSound("toggle");
          setOn((v) => !v);
        }}
      >
        <g>
          <Box
            {...toggle}
            r={6}
            front={
              <Glow on={on}>
                <rect x={6} y={8} width={20} height={36} rx={4} className={on ? "ik-dot" : "ik-well"} />
              </Glow>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}

export function DeskLamp() {
  const [on, setOn] = useState(false);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 70, d: 70, h: 6 };
  const stem: Box3 = { x: 28, y: 28, z: 6, w: 14, d: 14, h: 52 };
  const head: Box3 = { x: 12, y: 12, z: 58, w: 46, d: 46, h: 14 };
  return wrap(
    <Plate label="Desk lamp" fit={[base, stem, head]} fig="Fig. 03" name="Angle Lamp" hint="tap shade" readout={on ? "on · warm" : "off"}>
      <Box {...base} r={8} />
      <Box {...stem} r={3} />
      <Press
        label="Toggle lamp"
        material="metal"
        onPress={() => {
          playSound(on ? "release" : "relay");
          setOn((v) => !v);
        }}
      >
        <g>
          <Box
            {...head}
            r={6}
            front={
              <Glow on={on}>
                <circle cx={head.w / 2} cy={head.h / 2} r={8} className={on ? "ik-dot" : "ik-well"} />
              </Glow>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}

export function Doorbell() {
  const [rings, setRings] = useState(0);
  const mount: Box3 = { x: 0, y: 0, z: 0, w: 56, d: 56, h: 6 };
  const btn: Box3 = { x: 10, y: 10, z: 6, w: 36, d: 36, h: 12 };
  return wrap(
    <Plate label="Doorbell" fit={[mount, btn]} fig="Fig. 04" name="Front Bell" hint="press ring" readout={`rang ${rings}×`}>
      <Box {...mount} r={5} />
      <Press
        label="Ring doorbell"
        material="metal"
        onPress={() => {
          playSound("notify");
          setRings((n) => n + 1);
        }}
      >
        <g>
          <Box {...btn} r={18} top={<circle cx={btn.w / 2} cy={btn.d / 2} r={10} className="ik-well" />} />
        </g>
      </Press>
    </Plate>
  );
}

export function TallyKey() {
  const [n, setN] = useState(0);
  const key: Box3 = { x: 0, y: 0, z: 0, w: 58, d: 58, h: 14 };
  return wrap(
    <Plate label="Tally key" fit={[key]} fig="Fig. 05" name="Counter Key" hint="press to count" readout={`count ${n}`}>
      <Press label="Press key" material="rubber" onPress={() => setN((c) => c + 1)}>
        <g>
          <Box {...key} r={10} top={<text x={29} y={32} textAnchor="middle" className="ik-label" style={{ fontSize: 8 }}>{n}</text>} />
        </g>
      </Press>
    </Plate>
  );
}
