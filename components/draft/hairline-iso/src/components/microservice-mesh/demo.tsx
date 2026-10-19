"use client";

import MicroserviceMesh from "./microservice-mesh";

export default function MicroserviceMeshDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <MicroserviceMesh className="w-full max-w-md" intensity={0.5} aria-label="Microservice Cluster Mesh" />
    </div>
  );
}
