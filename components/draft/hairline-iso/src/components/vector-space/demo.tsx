"use client";

import VectorSpace from "./vector-space";

export default function VectorSpaceDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <VectorSpace className="w-full max-w-md" intensity={0.5} aria-label="Vector Embedding Space" />
    </div>
  );
}
