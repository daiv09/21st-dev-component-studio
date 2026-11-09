"use client";

import { useState, type ReactNode } from "react";
import { Box, Plate, Press, Glow, playSound, type Box3 } from "react-isokit";

const wrap = (node: ReactNode) => (
  <div className="w-full max-w-md mx-auto">{node}</div>
);

export function Thermostat() {
  const [temp, setTemp] = useState(20);
  const plate: Box3 = { x: 0, y: 0, z: 0, w: 72, d: 72, h: 6 };
  const body: Box3 = { x: 8, y: 8, z: 6, w: 56, d: 56, h: 12 };
  return wrap(
    <Plate label="Thermostat" fit={[plate, body]} fig="Fig. 14" name="Room Stat" hint="raise temp" readout={`set ${temp}°c`}>
      <Box {...plate} r={5} />
      <Press
        label="Increase temperature"
        material="plastic"
        onPress={() => {
          playSound("tick");
          setTemp((t) => Math.min(30, t + 1));
        }}
      >
        <g>
          <Box
            {...body}
            r={8}
            front={
              <g>
                <rect className="ik-screen" x={8} y={4} width={40} height={16} rx={2} />
                <Glow on>
                  <text className="ik-screen-text" x={14} y={14} style={{ fontSize: 7 }}>
                    {temp}°
                  </text>
                </Glow>
              </g>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}

export function SafeDial() {
  const [code, setCode] = useState(0);
  const body: Box3 = { x: 0, y: 0, z: 0, w: 90, d: 90, h: 14 };
  const dial: Box3 = { x: 22, y: 22, z: 14, w: 46, d: 46, h: 10 };
  return wrap(
    <Plate label="Safe" fit={[body, dial]} fig="Fig. 15" name="Vault" hint="spin dial" readout={`tumbler ${code % 10}`}>
      <Box {...body} r={6} front={<rect x={12} y={8} width={66} height={6} rx={2} className="ik-well" />} />
      <Press
        label="Spin safe dial"
        material="metal"
        onPress={() => {
          playSound("tick");
          setCode((c) => c + 1);
        }}
      >
        <g>
          <Box {...dial} r={20} top={<line x1={23} y1={23} x2={23} y2={10} className="ik-live" />} />
        </g>
      </Press>
    </Plate>
  );
}

export function AlarmClock() {
  const [mins, setMins] = useState(7 * 60 + 0);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 96, d: 56, h: 8 };
  const body: Box3 = { x: 6, y: 6, z: 8, w: 84, d: 44, h: 28 };
  const bell: Box3 = { x: 36, y: 6, z: 36, w: 24, d: 16, h: 10 };
  const h = Math.floor(mins / 60) % 12 || 12;
  const m = mins % 60;
  return wrap(
    <Plate label="Alarm clock" fit={[base, body, bell]} fig="Fig. 16" name="Bedside" hint="snooze +5" readout={`alarm ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`}>
      <Box {...base} r={4} />
      <Box
        {...body}
        r={4}
        front={
          <text className="ik-screen-text" x={12} y={18} style={{ fontSize: 8 }}>
            {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}
          </text>
        }
      />
      <Press
        label="Snooze five minutes"
        material="metal"
        onPress={() => {
          playSound("notify");
          setMins((t) => t + 5);
        }}
      >
        <g>
          <Box {...bell} r={4} />
        </g>
      </Press>
    </Plate>
  );
}

export function StampPad() {
  const [stamps, setStamps] = useState(0);
  const pad: Box3 = { x: 0, y: 0, z: 0, w: 80, d: 56, h: 8 };
  const block: Box3 = { x: 10, y: 10, z: 8, w: 60, d: 36, h: 14 };
  return wrap(
    <Plate label="Stamp pad" fit={[pad, block]} fig="Fig. 17" name="Approved" hint="stamp down" readout={`stamped ${stamps}×`}>
      <Box {...pad} r={4} />
      <Press
        label="Stamp document"
        material="rubber"
        onPress={() => {
          playSound("paper");
          setStamps((s) => s + 1);
        }}
      >
        <g>
          <Box
            {...block}
            r={3}
            top={<text x={30} y={20} textAnchor="middle" className="ik-label" style={{ fontSize: 6 }}>OK</text>}
          />
        </g>
      </Press>
    </Plate>
  );
}
