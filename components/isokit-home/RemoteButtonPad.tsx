"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Screen, isoMove, plateProps } from "./kit";

const BODY: Box3 = { x: 32, y: 24, z: 0, w: 104, d: 72, h: 12 };
const PAD: Box3 = { x: 40, y: 32, z: 12, w: 88, d: 56, h: 6 };

function key(i: number): Box3 {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return { x: 46 + col * 26, y: 38 + row * 16, z: 18, w: 20, d: 12, h: 6 };
}

const LABELS = ["pwr", "vol", "ch"];

export default function RemoteButtonPad() {
  const [down, setDown] = useState<number | null>(null);
  const [channel, setChannel] = useState(3);

  const press = (index: number) => {
    setDown(index);
    playSound("tick");
    if (index === 2) setChannel((c) => (c % 99) + 1);
    window.setTimeout(() => setDown(null), 180);
  };

  return (
    <Plate
      label="TV remote button pad"
      fit={[BODY, PAD, ...Array.from({ length: 9 }, (_, i) => key(i)), ...Array.from({ length: 9 }, (_, i) => ({ ...key(i), z: key(i).z - 4 }))]}
      readout={down === null ? `standby · ch ${channel}` : `${LABELS[down % 3] ?? "key"} · ch ${channel}`}
      {...plateProps("Home 16", "Remote", "press a key")}
    >
      <Box {...BODY} r={4} top={<Screen x={8} y={6} w={72} h={18} kicker="tv" line={`ch ${channel}`} lit={down !== null} />} />
      <Box {...PAD} r={3} />
      {Array.from({ length: 9 }, (_, i) => (
        <Press key={i} label={`Remote key ${i + 1}`} material="rubber" onPress={() => press(i)}>
          <g>
            <g style={isoMove(0, 0, down === i ? -4 : 0, i % 3, "var(--ik-t-press)")}>
              <Box {...key(i)} r={2} top={<text className="ik-label" x={4} y={8} style={{ fontSize: 4 }}>{i < 3 ? LABELS[i] : i + 1}</text>} />
            </g>
          </g>
        </Press>
      ))}
    </Plate>
  );
}
