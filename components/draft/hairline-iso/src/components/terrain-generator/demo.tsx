"use client";

import TerrainGenerator from "./terrain-generator";

export default function TerrainGeneratorDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <TerrainGenerator className="w-full max-w-md" intensity={0.5} aria-label="Procedural Terrain Generator" />
    </div>
  );
}
