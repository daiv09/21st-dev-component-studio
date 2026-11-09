"use client";

import { useState } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import { isoMove, plateProps, shift } from "./kit";

const CAB: Box3 = { x: 8, y: 16, z: 0, w: 152, d: 92, h: 120 };
const ROWS = 3;

function slot(row: number, col: number): Box3 {
  return { x: 20 + col * 36, y: 28 + row * 28, z: 16, w: 28, d: 22, h: 18 };
}

function snack(row: number, col: number): Box3 {
  const s = slot(row, col);
  return { x: s.x + 4, y: s.y + 4, z: s.z + 4, w: 20, d: 14, h: 10 };
}

export default function VendingSnackDrop() {
  const [picked, setPicked] = useState<{ row: number; col: number } | null>(null);
  const [drop, setDrop] = useState(false);

  const buy = (row: number, col: number) => {
    setPicked({ row, col });
    setDrop(false);
    playSound("relay");
    window.setTimeout(() => {
      setDrop(true);
      playSound("cascade", { count: 3, stagger: 0.06 });
    }, 120);
  };

  const label = picked ? `row ${picked.row + 1} col ${picked.col + 1}` : "—";

  return (
    <Plate
      label="Snack vending machine row"
      fit={[
        CAB,
        ...Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: 3 }, (_, c) => [slot(r, c), snack(r, c), shift(snack(r, c), 0, 48, -24)]),
        ).flat(2),
      ]}
      readout={drop ? `dropped · ${label}` : picked ? `vend · ${label}` : "select a slot"}
      {...plateProps("Home 15", "Vending", "press a snack")}
    >
      <Box {...CAB} r={4} front={<rect className="ik-screen" x={12} y={8} width={88} height={22} rx={2} />} />
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => (
          <Box key={`s-${r}-${c}`} {...slot(r, c)} r={2} top={<rect className="ik-well" x={4} y={4} width={20} height={14} rx={1} />} />
        )),
      )}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => {
          const body = snack(r, c);
          const falling = drop && picked?.row === r && picked.col === c;
          return (
            <Press key={`p-${r}-${c}`} label={`Vend snack row ${r + 1} column ${c + 1}`} material="plastic" onPress={() => buy(r, c)}>
              <g>
                <g style={isoMove(0, falling ? 48 : 0, falling ? -24 : 0, c)}>
                  <Box {...body} r={1} top={<text className="ik-label" x={2} y={8} style={{ fontSize: 4 }}>SNK</text>} />
                </g>
              </g>
            </Press>
          );
        }),
      )}
    </Plate>
  );
}
