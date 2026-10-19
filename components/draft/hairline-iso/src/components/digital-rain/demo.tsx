"use client";

import DigitalRain from "./digital-rain";

export default function DigitalRainDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <DigitalRain className="w-full max-w-md" intensity={0.5} aria-label="Matrix Digital Rain Monolith" />
    </div>
  );
}
