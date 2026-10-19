"use client";

import AttentionMatrix from "./attention-matrix";

export default function AttentionMatrixDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <AttentionMatrix className="w-full max-w-md" intensity={0.5} aria-label="Neural Network Activation Matrix" />
    </div>
  );
}
