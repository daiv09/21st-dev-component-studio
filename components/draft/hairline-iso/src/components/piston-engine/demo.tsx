"use client";

import PistonEngine from "./piston-engine";

export default function PistonEngineDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <PistonEngine className="w-full max-w-md" intensity={0.6} aria-label="Piston Engine Assembly" />
    </div>
  );
}
