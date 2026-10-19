"use client";

import RevenueTerrain from "./revenue-terrain";

export default function RevenueTerrainDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <RevenueTerrain className="w-full max-w-md" intensity={0.5} aria-label="Revenue Velocity Terrain" />
    </div>
  );
}
