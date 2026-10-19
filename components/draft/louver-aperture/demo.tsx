"use client";

import React, { useState } from "react";
import { LouverAperture } from "./louver-aperture";

export default function Page() {
  const [open, setOpen] = useState(0.55);
  const [slats, setSlats] = useState(12);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">Instrument · 22</div>
        <h1 className="text-2xl tracking-tight">Louver Aperture</h1>
        <LouverAperture open={open} slats={slats} size={480} />
      </div>
    </main>
  );
}
