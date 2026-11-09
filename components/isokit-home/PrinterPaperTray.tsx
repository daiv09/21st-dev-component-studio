"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { isoMove, plateProps, shift, useMotor } from "./kit";

const BODY: Box3 = { x: 8, y: 22, z: 0, w: 152, d: 82, h: 38 };
const TRAY: Box3 = { x: 16, y: 30, z: 8, w: 136, d: 58, h: 6 };
const SHEET: Box3 = { x: 48, y: 36, z: 14, w: 72, d: 46, h: 2 };
const EXTEND = 42;

export default function PrinterPaperTray() {
  const [out, setOut] = useState(false);
  const motor = useMotor();

  const toggle = () => {
    setOut((was) => {
      motor.start(0.65);
      playSound(was ? "latch" : "paper");
      return !was;
    });
  };

  return (
    <Plate
      label="Inkjet printer paper tray"
      fit={[BODY, TRAY, SHEET, shift(TRAY, 0, EXTEND, 0), shift(SHEET, 0, EXTEND, 0)]}
      readout={out ? "tray out · reload paper" : "tray in · ready to print"}
      {...plateProps("Home 10", "Printer tray", "press the tray")}
    >
      <Box {...BODY} r={3} top={<rect className="ik-screen" x={12} y={8} width={96} height={18} rx={2} />} />
      <Press label={out ? "Push the paper tray in" : "Pull the paper tray out"} material="plastic" onPress={toggle}>
        <g>
          <g style={isoMove(0, out ? EXTEND : 0, 0)}>
            <Box {...TRAY} r={2} />
            <Box {...SHEET} r={1} top={<path className="ik-detail" d="M 4 4 h 64" />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
