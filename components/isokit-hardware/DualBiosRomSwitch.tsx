"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, Screen, isoMove, plateProps, shift } from "./kit";

const BOARD: Box3 = { x: 0, y: 12, z: 0, w: 168, d: 100, h: 8 };
const PRIMARY: Box3 = { x: 22, y: 36, z: 8, w: 40, d: 28, h: 8 };
const BACKUP: Box3 = { x: 78, y: 36, z: 8, w: 40, d: 28, h: 8 };
const ACTUATOR: Box3 = { x: 124, y: 40, z: 8, w: 22, d: 16, h: 8 };
const TRAVEL = 18;

function Pins({ on }: { on: boolean }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <circle key={`a-${i}`} className={on ? "ik-fill" : "ik-well"} cx={6 + i * 8} cy={4} r={1.3} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={`b-${i}`} className={on ? "ik-fill" : "ik-well"} cx={6 + i * 8} cy={24} r={1.3} />
      ))}
    </g>
  );
}

export default function DualBiosRomSwitch() {
  const [primary, setPrimary] = useState(true);

  const toggle = () => {
    setPrimary((on) => !on);
    playSound("latch");
  };

  return (
    <Plate
      label="Motherboard dual BIOS dip switch"
      fit={[BOARD, PRIMARY, BACKUP, ACTUATOR, shift(ACTUATOR, TRAVEL, 0, 0)]}
      readout={primary ? "PRIMARY BIOS (OC)" : "BACKUP BIOS (SAFE)"}
      {...plateProps("Fig. 13", "Dual BIOS", "press the dip switch")}
    >
      <Box
        {...BOARD}
        r={4}
        top={
          <g>
            <Screen x={18} y={70} w={120} h={22} kicker="spi flash" line={primary ? "OC bank" : "safe bank"} lit />
            <rect className="ik-well" x={124} y={44} width={TRAVEL + 22} height={10} rx={2} />
          </g>
        }
      />
      <Box {...PRIMARY} r={2} top={<Pins on={primary} />} />
      <Box {...BACKUP} r={2} top={<Pins on={!primary} />} />
      <Press label={primary ? "Select backup BIOS" : "Select primary BIOS"} material="plastic" onPress={toggle}>
        <g>
          <g style={isoMove(primary ? 0 : TRAVEL, 0, 0)}>
            <Box
              {...ACTUATOR}
              r={2}
              top={<LiveMark x={3} y={5} w={16} />}
              front={<text className="ik-label" x={3} y={6} style={{ fontSize: 4 }}>DIP</text>}
            />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
