"use client";

import SortingConveyor from "./sorting-conveyor";

export default function SortingConveyorDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <SortingConveyor className="w-full max-w-md" intensity={0.5} aria-label="Multi-Floor Sorting Conveyor" />
    </div>
  );
}
