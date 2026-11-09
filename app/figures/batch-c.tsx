"use client";

import { useState, type ReactNode } from "react";
import { Box, Plate, Press, Glow, playSound, type Box3 } from "react-isokit";

const wrap = (node: ReactNode) => (
  <div className="w-full max-w-md mx-auto">{node}</div>
);

export function RadioTuner() {
  const [station, setStation] = useState(88);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 120, d: 70, h: 8 };
  const body: Box3 = { x: 8, y: 8, z: 8, w: 104, d: 54, h: 32 };
  const dial: Box3 = { x: 78, y: 18, z: 16, w: 24, d: 24, h: 10 };
  return wrap(
    <Plate label="Radio" fit={[base, body, dial]} fig="Fig. 10" name="FM Tuner" hint="turn dial" readout={`fm ${station.toFixed(1)}`}>
      <Box {...base} r={4} />
      <Box
        {...body}
        r={5}
        front={
          <g>
            <rect className="ik-screen" x={10} y={10} width={52} height={18} rx={2} />
            <Glow on>
              <text className="ik-screen-text" x={16} y={22} style={{ fontSize: 6 }}>
                {station.toFixed(1)}
              </text>
            </Glow>
          </g>
        }
      />
      <Press
        label="Tune radio"
        material="plastic"
        onPress={() => {
          playSound("tick");
          setStation((f) => (f >= 108 ? 88 : f + 0.5));
        }}
      >
        <g>
          <Box {...dial} r={12} top={<line x1={12} y1={12} x2={20} y2={8} className="ik-live" />} />
        </g>
      </Press>
    </Plate>
  );
}

export function VinylPlayer() {
  const [spin, setSpin] = useState(false);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 100, d: 100, h: 8 };
  const plinth: Box3 = { x: 10, y: 10, z: 8, w: 80, d: 80, h: 10 };
  const platter: Box3 = { x: 22, y: 22, z: 18, w: 56, d: 56, h: 4 };
  return wrap(
    <Plate label="Turntable" fit={[base, plinth, platter]} fig="Fig. 11" name="33 RPM" hint="start/stop" readout={spin ? "playing · 33" : "stopped"}>
      <Box {...base} r={6} />
      <Box {...plinth} r={4} />
      <Press
        label="Toggle turntable"
        material="rubber"
        onPress={() => {
          setSpin((s) => {
            if (s) playSound("release");
            else playSound("motor", { duration: 0.4 });
            return !s;
          });
        }}
      >
        <g>
          <Box
            {...platter}
            r={26}
            top={
              <g className={spin ? "ik-loop" : undefined}>
                <circle cx={platter.w / 2} cy={platter.d / 2} r={20} className="ik-well" />
                <circle cx={platter.w / 2} cy={platter.d / 2} r={3} className="ik-dot" />
              </g>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}

export function SpeakerCube() {
  const [vol, setVol] = useState(0);
  const box: Box3 = { x: 0, y: 0, z: 0, w: 64, d: 64, h: 72 };
  const cone: Box3 = { x: 14, y: 14, z: 14, w: 36, d: 36, h: 8 };
  return wrap(
    <Plate label="Speaker" fit={[box, cone]} fig="Fig. 12" name="Monitor" hint="tap cone" readout={`volume ${vol}%`}>
      <Box {...box} r={4} />
      <Press
        label="Adjust volume"
        material="paper"
        onPress={() => {
          playSound("tick");
          setVol((v) => (v >= 100 ? 0 : v + 20));
        }}
      >
        <g>
          <Box
            {...cone}
            r={14}
            front={
              <Glow on={vol > 0}>
                <circle cx={cone.w / 2} cy={cone.h / 2} r={vol > 60 ? 10 : 7} className={vol > 0 ? "ik-dot" : "ik-well"} />
              </Glow>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}

export function CoffeeGrinder() {
  const [step, setStep] = useState(0);
  const labels = ["coarse", "medium", "fine", "extra"];
  const base: Box3 = { x: 0, y: 0, z: 0, w: 56, d: 56, h: 8 };
  const hopper: Box3 = { x: 10, y: 10, z: 8, w: 36, d: 36, h: 28 };
  const dial: Box3 = { x: 16, y: 16, z: 36, w: 24, d: 24, h: 8 };
  return wrap(
    <Plate label="Grinder" fit={[base, hopper, dial]} fig="Fig. 13" name="Burr Mill" hint="click dial" readout={`grind · ${labels[step]}`}>
      <Box {...base} r={5} />
      <Box {...hopper} r={6} />
      <Press
        label="Set grind size"
        material="metal"
        onPress={() => {
          playSound("tick");
          setStep((s) => (s + 1) % labels.length);
        }}
      >
        <g>
          <Box
            {...dial}
            r={10}
            top={
              <text x={12} y={14} textAnchor="middle" className="ik-label" style={{ fontSize: 4 }}>
                {labels[step].slice(0, 3)}
              </text>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}
