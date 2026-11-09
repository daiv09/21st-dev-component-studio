"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, isoMove, plateProps, shift, useMotor } from "./kit";

const BED: Box3 = { x: 0, y: 20, z: 0, w: 168, d: 64, h: 10 };
const TRACK: Box3 = { x: 6, y: 72, z: 4, w: 150, d: 14, h: 6 };
const DRIVE: Box3 = { x: 138, y: 28, z: 10, w: 24, d: 30, h: 40 };
const PITCH = 26;

function slot(i: number): Box3 {
  return { x: 8 + i * PITCH, y: 28, z: 10, w: 20, d: 28, h: 36 };
}

const PICKER: Box3 = { x: 6, y: 68, z: 10, w: 24, d: 22, h: 30 };
const TAPE: Box3 = { x: 10, y: 30, z: 18, w: 14, d: 16, h: 22 };

export default function TapeArchiveAutoloader() {
  const [index, setIndex] = useState(0);
  const motor = useMotor();
  const loaded = index === 2;

  const advance = () => {
    setIndex((n) => (n + 1) % 5);
    motor.start(0.7);
    playSound("tick");
  };

  const names = ["slot 01", "slot 02", "SLOT 03 -> DRIVE A · 18 TB", "slot 04", "slot 05"];

  return (
    <Plate
      label="LTO-9 robotic tape library"
      fit={[BED, TRACK, DRIVE, ...[0, 1, 2, 3, 4].map(slot), PICKER, shift(PICKER, 4 * PITCH, 0, 0), TAPE, shift(TAPE, 4 * PITCH, 0, 0)]}
      readout={names[index]}
      {...plateProps("Fig. 17", "LTO-9 library", "press the picker")}
    >
      <Box {...BED} r={3} />
      <Box {...TRACK} r={2} top={<path className="ik-detail" d="M 6 7 h 138" />} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} {...slot(i)} r={2} front={<text className="ik-label" x={3} y={20} style={{ fontSize: 5 }}>{`0${i + 1}`}</text>} />
      ))}
      <Box {...DRIVE} r={2} front={<text className="ik-label" x={4} y={22} style={{ fontSize: 6 }}>{loaded ? "18T" : "A"}</text>} />
      <Press label="Move the tape picker to the next slot" material="metal" onPress={advance}>
        <g>
          <g style={isoMove(index * PITCH, 0, 0)}>
            <Box
              {...PICKER}
              r={2}
              front={<LiveMark x={4} y={8} w={16} />}
              side={<path className="ik-detail" d="M 4 6 h 14 M 4 12 h 14" />}
            />
            <Box {...TAPE} r={1} top={<text className="ik-label" x={2} y={10} style={{ fontSize: 4 }}>LTO</text>} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
