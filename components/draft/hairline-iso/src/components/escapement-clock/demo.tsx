"use client";

import EscapementClock from "./escapement-clock";

export default function EscapementClockDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <EscapementClock className="w-full max-w-md" intensity={0.5} aria-label="Escapement Gear Clock" />
    </div>
  );
}
