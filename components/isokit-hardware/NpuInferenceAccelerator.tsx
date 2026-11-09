"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Box, Plate, Press, playSound, type Box3 } from "react-isokit";
import "react-isokit/styles.css";
import "react-isokit/themes.css";

function useMotor() {
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);
  return {
    start(duration: number) {
      stop.current?.();
      stop.current = playSound("motor", { duration });
    },
    cut() {
      stop.current?.();
      stop.current = null;
    },
  };
}

function LiveMark({ x, y, w }: { x: number; y: number; w: number }) {
  return <path className="ik-live" d={`M ${x} ${y} h ${w}`} />;
}

function plateProps(fig: string, name: string, hint: string) {
  return { fig, name, hint, aspect: 1.25, pad: 0.11 } as const;
}

const CARD: Box3 = { x: 6, y: 28, z: 0, w: 156, d: 62, h: 8 };
const BRACKET: Box3 = { x: 0, y: 22, z: 0, w: 8, d: 74, h: 28 };

function tile(index: number): Box3 {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { x: 28 + col * 28, y: 36 + row * 14, z: 8, w: 22, d: 10, h: 8 };
}

export default function NpuInferenceAccelerator() {
  const [run, setRun] = useState(false);
  const motor = useMotor();
  const tiles = Array.from({ length: 16 }, (_, i) => i);

  const toggle = () => {
    setRun((was) => {
      const next = !was;
      if (next) {
        motor.start(1.4);
        playSound("cascade", { count: 8, stagger: 0.05 });
      } else {
        motor.cut();
        playSound("done");
      }
      return next;
    });
  };

  return (
    <>
      <style>{`
        .ik-hw-wave {
          transform: translateY(0);
        }
        .ik-plate svg[data-run="on"] .ik-hw-wave {
          animation: ik-hw-bob var(--ik-t-move) var(--ik-ease-move) infinite;
          animation-delay: calc(var(--i) * var(--ik-stagger));
        }
        @keyframes ik-hw-bob {
          0%,
          100% {
            transform: none;
          }
          50% {
            transform: translateY(-7px);
          }
        }
      `}</style>
      <Plate
        label="Edge AI NPU PCIe card"
        fit={[
          CARD,
          BRACKET,
          ...tiles.map((i) => ({ ...tile(i), z: tile(i).z + 10 })),
        ]}
        readout={run ? "INT4 QUANTIZED · 180 TOPS" : "npu idle · array dark"}
        data-run={run ? "on" : "off"}
        {...plateProps("Fig. 11", "Edge NPU", "press the array")}
      >
        <Box
          {...CARD}
          r={3}
          top={
            <path
              className="ik-detail"
              d="M 12 8 h 132 M 12 54 h 132"
            />
          }
        />
        <Box {...BRACKET} r={2} />
        <Press
          label={
            run ? "Stop the systolic array" : "Run the systolic array"
          }
          material="glass"
          onPress={toggle}
        >
          <g>
            <g>
              {tiles.map((i) => (
                <g
                  key={i}
                  className="ik-hw-wave ik-loop"
                  style={{ "--i": i } as CSSProperties}
                >
                  <Box
                    {...tile(i)}
                    r={1}
                    top={
                      <g>
                        <rect
                          className={run ? "ik-fill" : "ik-well"}
                          x={3}
                          y={2}
                          width={16}
                          height={6}
                        />
                        {((!run && i === 0) || (run && i === 15)) && (
                          <LiveMark x={3} y={1} w={16} />
                        )}
                      </g>
                    }
                  />
                </g>
              ))}
            </g>
          </g>
        </Press>
      </Plate>
    </>
  );
}
