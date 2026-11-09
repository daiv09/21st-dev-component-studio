"use client";

import { useState, type ReactNode } from "react";
import { Box, Plate, Press, Glow, playSound, type Box3 } from "react-isokit";

const wrap = (node: ReactNode) => (
  <div className="w-full max-w-md mx-auto">{node}</div>
);

export function PrinterFeed() {
  const [pages, setPages] = useState(0);
  const base: Box3 = { x: 0, y: 0, z: 0, w: 100, d: 80, h: 8 };
  const body: Box3 = { x: 8, y: 8, z: 8, w: 84, d: 64, h: 36 };
  const tray: Box3 = { x: 20, y: 50, z: 8, w: 60, d: 22, h: 6 };
  return wrap(
    <Plate label="Printer" fit={[base, body, tray]} fig="Fig. 18" name="LaserJet" hint="feed paper" readout={`printed ${pages} pg`}>
      <Box {...base} r={4} />
      <Box {...body} r={4} front={<rect className="ik-screen" x={10} y={8} width={40} height={14} rx={2} />} />
      <Press
        label="Print page"
        material="plastic"
        onPress={() => {
          playSound("process", { duration: 0.3 });
          setPages((p) => p + 1);
        }}
      >
        <g>
          <Box {...tray} r={2} top={<rect x={8} y={4} width={44} height={10} className="ik-fill" />} />
        </g>
      </Press>
    </Plate>
  );
}

export function TvSet() {
  const [on, setOn] = useState(false);
  const stand: Box3 = { x: 0, y: 0, z: 0, w: 100, d: 40, h: 8 };
  const screen: Box3 = { x: 10, y: 10, z: 8, w: 80, d: 12, h: 52 };
  return wrap(
    <Plate label="Television" fit={[stand, screen]} fig="Fig. 19" name="Flat Panel" hint="tap screen" readout={on ? "on · ch 4" : "standby"}>
      <Box {...stand} r={3} />
      <Press
        label="Power television"
        material="glass"
        onPress={() => {
          playSound("toggle");
          setOn((v) => !v);
        }}
      >
        <g>
          <Box
            {...screen}
            r={2}
            front={
              <Glow on={on}>
                <rect x={4} y={4} width={screen.w - 8} height={screen.h - 8} rx={1} className={on ? "ik-screen" : "ik-well"} />
                {on && (
                  <text className="ik-screen-text" x={10} y={28} style={{ fontSize: 6 }}>
                    ch 4
                  </text>
                )}
              </Glow>
            }
          />
        </g>
      </Press>
    </Plate>
  );
}

export function ApprovalPad() {
  const [state, setState] = useState<"wait" | "allow" | "deny">("wait");
  const base: Box3 = { x: 0, y: 0, z: 0, w: 130, d: 72, h: 8 };
  const panel: Box3 = { x: 6, y: 6, z: 8, w: 118, d: 60, h: 20 };
  const allow: Box3 = { x: 12, y: 14, z: 28, w: 48, d: 28, h: 10 };
  const deny: Box3 = { x: 70, y: 14, z: 28, w: 48, d: 28, h: 10 };
  return wrap(
    <Plate
      label="Approval pad"
      fit={[base, panel, allow, deny]}
      fig="Fig. 20"
      name="Agent Gate"
      hint="allow or deny"
      readout={state === "wait" ? "4 waiting" : state === "allow" ? "allowed" : "denied"}
    >
      <Box {...base} r={4} />
      <Box
        {...panel}
        r={3}
        front={
          <text className="ik-screen-text" x={10} y={14} style={{ fontSize: 5 }}>
            claude code · {state === "wait" ? "4 waiting" : state}
          </text>
        }
      />
      <Press
        label="Allow"
        material="rubber"
        onPress={() => {
          playSound("success");
          setState("allow");
        }}
      >
        <g>
          <Box {...allow} r={4} top={<text x={24} y={16} textAnchor="middle" className="ik-label" style={{ fontSize: 5 }}>allow</text>} />
        </g>
      </Press>
      <Press
        label="Deny"
        material="rubber"
        onPress={() => {
          playSound("error");
          setState("deny");
        }}
      >
        <g>
          <Box {...deny} r={4} top={<text x={24} y={16} textAnchor="middle" className="ik-label" style={{ fontSize: 5 }}>deny</text>} />
        </g>
      </Press>
    </Plate>
  );
}

export function PagePress() {
  const [blocks, setBlocks] = useState(0);
  const bed: Box3 = { x: 0, y: 0, z: 0, w: 110, d: 80, h: 8 };
  const platen: Box3 = { x: 12, y: 12, z: 8, w: 86, d: 56, h: 10 };
  const lever: Box3 = { x: 42, y: 30, z: 18, w: 26, d: 20, h: 22 };
  return wrap(
    <Plate label="Page press" fit={[bed, platen, lever]} fig="Fig. 21" name="Publish" hint="press to seat" readout={`draft · ${blocks} blocks`}>
      <Box {...bed} r={4} />
      <Box {...platen} r={3} top={<rect x={8} y={8} width={70} height={40} className="ik-well" />} />
      <Press
        label="Publish block"
        material="metal"
        onPress={() => {
          playSound("latch");
          setBlocks((b) => Math.min(4, b + 1));
        }}
      >
        <g>
          <Box {...lever} r={3} />
        </g>
      </Press>
    </Plate>
  );
}
