"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { LiveMark, isoMove, plateProps, shift } from "./kit";

const CHASSIS: Box3 = { x: 4, y: 10, z: 0, w: 160, d: 86, h: 16 };
const PORTS = 8;

function cage(i: number): Box3 {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return { x: 16 + col * 36, y: 22 + row * 30, z: 16, w: 28, d: 22, h: 8 };
}

function sfpModule(i: number): Box3 {
  const slot = cage(i);
  return { x: slot.x + 4, y: slot.y + 4, z: slot.z + 6, w: 20, d: 14, h: 8 };
}

export default function SfpNetworkSwitch() {
  const [plugged, setPlugged] = useState<boolean[]>([false, false, false, false, false, false, false, false]);
  const [focus, setFocus] = useState(0);
  const ids = Array.from({ length: PORTS }, (_, i) => i);

  const toggle = (index: number) => {
    setFocus(index);
    setPlugged((prev) => {
      const next = prev.map((on, i) => (i === index ? !on : on));
      if (next[index]) playSound("cascade", { count: 4, stagger: 0.05 });
      else playSound("tick");
      return next;
    });
  };

  const order = [...ids].sort((a, b) => Number(plugged[a]) - Number(plugged[b]) || a - b);
  const label = String(focus + 1).padStart(2, "0");

  return (
    <Plate
      label="24-port 100GbE top-of-rack switch"
      fit={[
        CHASSIS,
        ...ids.flatMap((i) => [cage(i), sfpModule(i), shift(sfpModule(i), 0, -18, 14)]),
      ]}
      readout={plugged[focus] ? `PORT ${label} UP · 100GbE RDMA` : `port ${label} dark · 24-port tor`}
      {...plateProps("Fig. 07", "100GbE switch", "press a cage")}
    >
      <Box
        {...CHASSIS}
        r={3}
        top={
          <g>
            {Array.from({ length: 24 }, (_, n) => (
              <rect key={n} className="ik-well" x={6 + (n % 12) * 12} y={n < 12 ? 4 : 74} width={8} height={4} rx={1} />
            ))}
          </g>
        }
      />
      {ids.map((i) => (
        <Box key={`cage-${i}`} {...cage(i)} r={2} top={<rect className="ik-well" x={4} y={4} width={20} height={14} rx={1} />} />
      ))}
      {order.map((i) => {
        const body = sfpModule(i);
        const seated = plugged[i];
        return (
          <Press key={i} label={`${seated ? "Unplug" : "Plug"} SFP port ${i + 1}`} material="plastic" onPress={() => toggle(i)}>
            <g>
              <g style={isoMove(0, seated ? 0 : -18, seated ? 0 : 14, i % 4)}>
                <Box
                  {...body}
                  r={2}
                  top={
                    <g>
                      <rect className="ik-fill" x={3} y={3} width={14} height={8} rx={1} />
                      {focus === i && <LiveMark x={2} y={2} w={16} />}
                    </g>
                  }
                  front={<path className="ik-detail" d="M 3 4 h 14" />}
                />
              </g>
            </g>
          </Press>
        );
      })}
    </Plate>
  );
}
