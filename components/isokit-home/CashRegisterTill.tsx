"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Screen, isoMove, plateProps, shift, useMotor } from "./kit";

const BODY: Box3 = { x: 16, y: 24, z: 0, w: 136, d: 78, h: 48 };
const TILL: Box3 = { x: 24, y: 32, z: 8, w: 120, d: 52, h: 8 };
const OUT = 36;

export default function CashRegisterTill() {
  const [open, setOpen] = useState(false);
  const motor = useMotor();

  const toggle = () => {
    setOpen((was) => {
      const next = !was;
      motor.start(0.55);
      playSound("relay");
      window.setTimeout(() => playSound(next ? "success" : "latch"), 100);
      return next;
    });
  };

  return (
    <Plate
      label="Cash register till drawer"
      fit={[BODY, TILL, shift(TILL, 0, OUT, 0)]}
      readout={open ? "till open · $24.50" : "till closed · sale done"}
      {...plateProps("Home 08", "Register", "press the till")}
    >
      <Box {...BODY} r={4} front={<Screen x={12} y={6} w={96} h={28} kicker="total" line={open ? "$24.50" : "$0.00"} lit={open} />} />
      <Press label={open ? "Close the cash till" : "Pop the cash till"} material="metal" onPress={toggle}>
        <g>
          <g style={isoMove(0, open ? OUT : 0, 0)}>
            <Box {...TILL} r={2} top={<rect className="ik-well" x={8} y={6} width={104} height={38} rx={2} />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
