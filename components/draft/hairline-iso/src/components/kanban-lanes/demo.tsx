"use client";

import KanbanLanes from "./kanban-lanes";

export default function KanbanLanesDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <KanbanLanes className="w-full max-w-md" intensity={0.5} aria-label="Kanban Isometric Lanes" />
    </div>
  );
}
