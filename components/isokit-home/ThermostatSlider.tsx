"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { Screen, isoMove, plateProps, shift } from "./kit";

const BACK: Box3 = { x: 32, y: 20, z: 0, w: 104, d: 88, h: 8 };
const RAIL: Box3 = { x: 40, y: 28, z: 8, w: 88, d: 12, h: 6 };
const SLIDER: Box3 = { x: 44, y: 30, z: 14, w: 24, d: 8, h: 10 };
const STEPS = [18, 20, 22, 24];

export default function ThermostatSlider() {
  const [step, setStep] = useState(1);

  const nudge = () => {
    setStep((s) => (s + 1) % STEPS.length);
    playSound("tick");
  };

  const travel = step * 18;

  return (
    <Plate
      label="Wall thermostat slider"
      fit={[BACK, RAIL, SLIDER, shift(SLIDER, travel, 0, 0), shift(SLIDER, 54, 0, 0)]}
      readout={`setpoint · ${STEPS[step]}°C`}
      {...plateProps("Home 07", "Thermostat", "press the slider")}
    >
      <Box {...BACK} r={3} front={<Screen x={8} y={4} w={88} h={28} kicker="heat" line={`${STEPS[step]} C`} lit={step > 1} />} />
      <Box {...RAIL} r={2} top={<path className="ik-detail" d="M 4 4 h 80 M 4 8 h 80" />} />
      <Press label="Step the thermostat setpoint" material="plastic" onPress={nudge}>
        <g>
          <g style={isoMove(travel, 0, 0)}>
            <Box {...SLIDER} r={2} top={<path className="ik-live" d="M 4 3 h 16" />} />
          </g>
        </g>
      </Press>
    </Plate>
  );
}
