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
  const Component = nextDynamic(() => import(`@/app/${folder}/${slug}`), {
    ssr: false,
    loading: () => mounting({ slug }),
  });
  return { slug, title, folder, Component };
}

// --- app/generated (pre-plan trio) -------------------------------------------
const GENERATED: Entry[] = [
  reg("generated", "orbital-gyro-field", "Orbital Gyro Field"),
  reg("generated", "phosphor-radar", "Phosphor Radar"),
  reg("generated", "seismic-monitor", "Seismic Monitor"),
];

// --- Batch A — DOM + spring instruments --------------------------------------
const BATCH_A: Entry[] = [
  reg("components", "wooden-abacus", "Merchant's Abacus"),
  reg("components", "simon-solenoid-memory", "Solenoid Memory Bank"),
  reg("components", "letter-gallows", "Letter Gallows"),
  reg("components", "newtons-cradle-array", "Momentum Cradle"),
  reg("components", "morse-telegraph-key", "Sounder & Key"),
  reg("components", "typebar-typewriter", "Typebar Studio"),
  reg("components", "domino-run-builder", "Cascade Yard"),
];

// --- Batch B — typography & pattern engines -----------------------------------
const BATCH_B: Entry[] = [
  reg("components", "variable-weight-wave", "Weight Wave"),
  reg("components", "radial-seal-rings", "Radial Seal"),
  reg("components", "anagram-swarm", "Anagram Swarm"),
  reg("components", "truchet-stream-walls", "Truchet Streams"),
  reg("components", "moire-turntables", "Moiré Turntables"),
  reg("components", "dragon-curve-unfolder", "Dragon Curve"),
  reg("components", "hex-life-colony", "Hex Colony"),
];

// --- Batch C — particle & grid simulations ------------------------------------
const BATCH_C: Entry[] = [
  reg("components", "galton-quincunx", "Galton Quincunx"),
  reg("components", "heptagon-orbit-balls", "Heptagon Orbit"),
  reg("components", "cloud-chamber-detector", "Cloud Chamber"),
  reg("components", "boids-hawk", "Murmuration Bench"),
  reg("components", "falling-sand-pourer", "Sand Foundry"),
  reg("components", "reaction-diffusion", "Turing Garden"),
  reg("components", "ripple-tank-interference", "Ripple Tank"),
];

// --- Batch D — linkages & body physics ----------------------------------------
const BATCH_D: Entry[] = [
  reg("components", "pendulum-wave-array", "Pendulum Wave"),
  reg("components", "double-pendulum-chaos", "Chaos Bench"),
  reg("components", "synchronizing-metronomes", "Consensus Rack"),
  reg("components", "soft-body-jelly", "Jelly Slab"),
  reg("components", "tensegrity-mast", "Tensegrity Mast"),
  reg("components", "calder-balancing-mobile", "Counterweight Sculpture"),
  reg("components", "gear-train-pegboard", "Gear Yard"),
];

// --- Batch E — mathematical geometry machines ---------------------------------
const BATCH_E: Entry[] = [
  reg("components", "phyllotaxis-bloom", "Phyllotaxis Bloom"),
  reg("components", "tesseract-rotator", "Tesseract Bench"),
  reg("components", "lorenz-observatory", "Lorenz Observatory"),
  reg("components", "magnetic-field-lines", "Field Line Bench"),
  reg("components", "fourier-epicycle-drawer", "Fourier Epicycles"),
  reg("components", "solar-analemma", "Solar Analemma"),
  reg("components", "orrery-time-machine", "Orrery Time Machine"),
];

// --- Batch F — systems, games & strategy --------------------------------------
const BATCH_F: Entry[] = [
  reg("components", "wind-turbine-farm", "Wind Farm Dispatch"),
  reg("components", "logic-gate-routing", "Logic Gate Yard"),
  reg("components", "traffic-signal-intersection", "Signal Crossing Bench"),
  reg("components", "network-packet-topology", "Packet Topology Fabric"),
  reg("components", "breakout-debris-wall", "Debris Wall"),
  reg("components", "light-cycle-arena", "Light Cycle Arena"),
  reg("components", "enigma-rotor-cipher", "Rotor Cipher Machine"),
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
