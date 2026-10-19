"use client";

import HydraulicArm from "./hydraulic-arm";

export default function HydraulicArmDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <HydraulicArm className="w-full max-w-md" intensity={0.5} aria-label="Hydraulic Robotic Arm" />
    </div>
  );
}
