"use client";

import HydraulicArm from "./hydraulic-arm";

export default function HydraulicArmDemoPage() {
  return (
    <main className="flex min-h-screen w-screen items-center justify-center p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-xl">
        <HydraulicArm />
      </div>
    </main>
  );
}
