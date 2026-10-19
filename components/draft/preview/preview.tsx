"use client";

/**
 * /preview — isolated QA gallery. Renders every library component lazily
 * (ssr: false) in a scroll-snap stack so each can be inspected full-screen
 * without touching app/page.tsx. Register new components here as batches land.
 */

import React from "react";
import nextDynamic, { type DynamicOptionsLoadingProps } from "next/dynamic";

interface Entry {
  slug: string;
  title: string;
  folder: string;
  Component: React.ComponentType;
}

function mounting(props: DynamicOptionsLoadingProps & { slug?: string }) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
      <span className="font-mono text-xs tracking-[0.35em] uppercase text-neutral-600">
        mounting {props.slug ?? "component"}…
      </span>
    </div>
  );
}

function reg(folder: string, slug: string, title: string): Entry {
  const Component = nextDynamic(() => import(`@/components/${folder}/${slug}/${slug}`), {
    ssr: false,
    loading: () => mounting({ slug }),
  });
  return { slug, title, folder, Component };
}

// --- app/generated (pre-plan trio) -------------------------------------------
const GENERATED: Entry[] = [
  reg("draft/generated", "orbital-gyro-field", "Orbital Gyro Field"),
  reg("draft/generated", "phosphor-radar", "Phosphor Radar"),
  reg("draft/generated", "seismic-monitor", "Seismic Monitor"),
];

// --- Batch A — DOM + spring instruments --------------------------------------
const BATCH_A: Entry[] = [
  reg("draft", "wooden-abacus", "Merchant's Abacus"),
  reg("draft", "simon-solenoid-memory", "Solenoid Memory Bank"),
  reg("draft", "letter-gallows", "Letter Gallows"),
  reg("draft", "newtons-cradle-array", "Momentum Cradle"),
  reg("draft", "morse-telegraph-key", "Sounder & Key"),
  reg("draft", "typebar-typewriter", "Typebar Studio"),
  reg("draft", "domino-run-builder", "Cascade Yard"),
];

// --- Batch B — typography & pattern engines -----------------------------------
const BATCH_B: Entry[] = [
  reg("draft", "variable-weight-wave", "Weight Wave"),
  reg("draft", "radial-seal-rings", "Radial Seal"),
  reg("draft", "anagram-swarm", "Anagram Swarm"),
  reg("draft", "truchet-stream-walls", "Truchet Streams"),
  reg("draft", "moire-turntables", "Moiré Turntables"),
  reg("draft", "dragon-curve-unfolder", "Dragon Curve"),
  reg("draft", "hex-life-colony", "Hex Colony"),
];

// --- Batch C — particle & grid simulations ------------------------------------
const BATCH_C: Entry[] = [
  reg("draft", "galton-quincunx", "Galton Quincunx"),
  reg("draft", "heptagon-orbit-balls", "Heptagon Orbit"),
  reg("draft", "cloud-chamber-detector", "Cloud Chamber"),
  reg("draft", "boids-hawk", "Murmuration Bench"),
  reg("draft", "falling-sand-pourer", "Sand Foundry"),
  reg("draft", "reaction-diffusion", "Turing Garden"),
  reg("draft", "ripple-tank-interference", "Ripple Tank"),
];

// --- Batch D — linkages & body physics ----------------------------------------
const BATCH_D: Entry[] = [
  reg("draft", "pendulum-wave-array", "Pendulum Wave"),
  reg("draft", "double-pendulum-chaos", "Chaos Bench"),
  reg("draft", "synchronizing-metronomes", "Consensus Rack"),
  reg("draft", "soft-body-jelly", "Jelly Slab"),
  reg("draft", "tensegrity-mast", "Tensegrity Mast"),
  reg("draft", "calder-balancing-mobile", "Counterweight Sculpture"),
  reg("draft", "gear-train-pegboard", "Gear Yard"),
];

// --- Batch E — mathematical geometry machines ---------------------------------
const BATCH_E: Entry[] = [
  reg("draft", "phyllotaxis-bloom", "Phyllotaxis Bloom"),
  reg("draft", "tesseract-rotator", "Tesseract Bench"),
  reg("draft", "lorenz-observatory", "Lorenz Observatory"),
  reg("draft", "magnetic-field-lines", "Field Line Bench"),
  reg("draft", "fourier-epicycle-drawer", "Fourier Epicycles"),
  reg("draft", "solar-analemma", "Solar Analemma"),
  reg("draft", "orrery-time-machine", "Orrery Time Machine"),
];

// --- Batch F — systems, games & strategy --------------------------------------
const BATCH_F: Entry[] = [
  reg("draft", "wind-turbine-farm", "Wind Farm Dispatch"),
  reg("draft", "logic-gate-routing", "Logic Gate Yard"),
  reg("draft", "traffic-signal-intersection", "Signal Crossing Bench"),
  reg("draft", "network-packet-topology", "Packet Topology Fabric"),
  reg("draft", "breakout-debris-wall", "Debris Wall"),
  reg("draft", "light-cycle-arena", "Light Cycle Arena"),
  reg("draft", "enigma-rotor-cipher", "Rotor Cipher Machine"),
];

const GALLERY: Entry[] = [
  ...GENERATED,
  ...BATCH_A,
  ...BATCH_B,
  ...BATCH_C,
  ...BATCH_D,
  ...BATCH_E,
  ...BATCH_F,
];

export default function PreviewPage() {
  return (
    <div className="bg-black">
      {/* Sticky index */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/95 backdrop-blur px-6 py-3">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-500 whitespace-nowrap">
            Component Studio QA — {GALLERY.length} mounted
          </span>
          {GALLERY.map((e) => (
            <a
              key={e.slug}
              href={`#${e.slug}`}
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400 hover:text-amber-300 whitespace-nowrap transition-colors"
            >
              {e.title}
            </a>
          ))}
        </div>
      </header>

      {GALLERY.map((e) => (
        <section key={e.slug} id={e.slug} className="relative snap-start">
          {/* Specimen plate */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600 bg-black/70 border border-neutral-800 rounded-full px-4 py-1">
              {e.title} · {e.folder}/{e.slug}
            </span>
          </div>
          <e.Component />
        </section>
      ))}

      <footer className="border-t border-neutral-900 py-10 text-center">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-700">
          end of gallery
        </span>
      </footer>

      <style jsx global>{`
        html {
          scroll-snap-type: y proximity;
        }
      `}</style>
    </div>
  );
}
