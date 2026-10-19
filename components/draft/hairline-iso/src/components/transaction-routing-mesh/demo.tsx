"use client";

import TransactionRoutingMesh from "./transaction-routing-mesh";

export default function TransactionRoutingMeshDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <TransactionRoutingMesh className="w-full max-w-md" intensity={0.5} aria-label="Transaction Routing Mesh" />
    </div>
  );
}
