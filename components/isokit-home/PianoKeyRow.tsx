"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { isoMove, plateProps } from "./kit";

const BODY: Box3 = { x: 8, y: 20, z: 0, w: 152, d: 88, h: 14 };
const KEYBED: Box3 = { x: 16, y: 28, z: 14, w: 136, d: 72, h: 6 };
const KEYS = 12;

function whiteKey(i: number): Box3 {
  return { x: 20 + i * 11, y: 32, z: 20, w: 9, d: 56, h: 10 };
}

export default function PianoKeyRow() {
  const [active, setActive] = useState<number | null>(null);
  const [note, setNote] = useState("C4");

  const names = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E", "F", "G"];

  const strike = (index: number) => {
    setActive(index);
    setNote(`${names[index]}4`);
    playSound("tick");
    window.setTimeout(() => setActive(null), 200);
  };

  return (
    <Plate
      label="Desktop piano key row"
      fit={[BODY, KEYBED, ...Array.from({ length: KEYS }, (_, i) => whiteKey(i)), ...Array.from({ length: KEYS }, (_, i) => ({ ...whiteKey(i), z: whiteKey(i).z - 5 }))]}
      readout={active === null ? "rest · lift to play" : `note · ${note}`}
      {...plateProps("Home 17", "Piano", "press a key")}
    >
      <Box {...BODY} r={3} />
      <Box {...KEYBED} r={2} />
      {Array.from({ length: KEYS }, (_, i) => (
        <Press key={i} label={`Play piano key ${names[i]}`} material="plastic" onPress={() => strike(i)}>
          <g>
            <g style={isoMove(0, 0, active === i ? -5 : 0, i % 4, "var(--ik-t-press)")}>
              <Box {...whiteKey(i)} r={1} top={<path className="ik-detail" d="M 2 4 h 5" />} />
            </g>
          </g>
        </Press>
      ))}
    </Plate>
  );
}
