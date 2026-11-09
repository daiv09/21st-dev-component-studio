"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, Screen, isoMove, plateProps, shift, useInterval } from "./kit";

const BOARD: Box3 = { x: 0, y: 18, z: 0, w: 168, d: 100, h: 8 };
const POT: Box3 = { x: 48, y: 28, z: 8, w: 64, d: 52, h: 46 };
const RIM: Box3 = { x: 42, y: 22, z: 54, w: 76, d: 64, h: 6 };
const SHOT: Box3 = { x: 68, y: 42, z: 60, w: 22, d: 18, h: 8 };

export default function LiquidNitrogenPot() {
  const [temp, setTemp] = useState(24);
  const [poured, setPoured] = useState(false);
  const clock = useInterval();
  const cold = temp <= -196;

  const pour = () => {
    if (poured) {
      clock.clear();
      setPoured(false);
      setTemp(24);
      playSound("whoosh");
      return;
    }
    setPoured(true);
    playSound("relay");
    let current = 24;
    clock.start(() => {
      current = Math.max(-196, current - 44);
      setTemp(current);
      playSound("tick");
      if (current <= -196) {
        playSound("success");
        return true;
      }
      return false;
    }, 160);
  };

  return (
    <Plate
      label="Extreme overclock LN2 evaporator pot"
      fit={[BOARD, POT, RIM, SHOT, shift(SHOT, 0, 0, 16)]}
      readout={cold ? "-196°C · 8.4 GHz VALIDATED" : `pot · ${temp}°C`}
      {...plateProps("Fig. 14", "LN2 pot", "press the pot")}
    >
      <Box {...BOARD} r={4} top={<Screen x={8} y={68} w={150} h={24} kicker="evap" line={cold ? "-196 C" : `${temp} C`} lit={poured} />} />
      <Press label={poured ? "Vent the LN2 pot" : "Pour a shot of LN2"} material="metal" onPress={pour}>
        <g>
          <g>
            <Box {...POT} r={4} front={<path className="ik-detail" d="M 8 12 h 48 M 8 24 h 48 M 8 36 h 48" />} />
            <Box {...RIM} r={3} top={<g><LiveMark x={10} y={12} w={56} /><rect className="ik-well" x={14} y={14} width={48} height={36} rx={4} /></g>} />
          </g>
        </g>
      </Press>
      {poured && (
        <g className="ik-hw-shot" style={isoMove(0, 0, cold ? 0 : 6)}>
          <Box {...SHOT} r={2} />
        </g>
      )}
    </Plate>
  );
}
