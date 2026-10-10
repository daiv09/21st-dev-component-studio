'use client';

import React, { useState } from 'react';
import MagneticFluxField from './magnetic-flux-field';
import PlasmaOrb from './plasma-orb';
import QuantumLatticeWaves from './quantum-lattice-waves';
import AudioWaveSculptor from './audio-wave-sculptor';
import DNAHelixStream from './dna-helix-stream';
import GalaxySpiral from './galaxy-spiral';
import LightningFractal from './lightning-fractal';
import MetaballBlobs from './metaball-blobs';
import VoronoiTessellation from './voronoi-tessellation';
import NeonTunnel from './neon-tunnel';
import LiquidMercury from './liquid-mercury';
import KaleidoscopeSymmetry from '../../submitted/kaleidoscope-symmetry';
import ConstellationMapper from './constellation-mapper';
import ReactionDiffusionFlow from './reaction-diffusion-flow';
import RibbonFollower from './ribbon-follower';
import CellularAutomataLife from './cellular-automata-life';
import BoidsFlocking from './boids-flocking';
import FlowFieldPaint from './flow-field-paint';
import SmokeCursorTrail from './smoke-cursor-trail';
import PerlinNoiseTerrain from './perlin-noise-terrain';
import GravityOrbits from './gravity-orbits';
import IsometricCubeMarch from './isometric-cube-march';
import LissajousOrbiter from './lissajous-orbiter';
import PaperFoldingGrid from './paper-folding-grid';
import LaserGridShooter from './laser-grid-shooter';
import PixelDissolveRebuild from './pixel-dissolve-rebuild';
import RipplePond from './ripple-pond';
import SpectrumAnalyzer from './spectrum-analyzer';
import StrangeAttractor from './strange-attractor';
import ParticlesTextWarp from './particles-text-warp';
import VectorFieldArrow from './vector-field-arrow';
import RibbonWindTunnel from './ribbon-wind-tunnel';
import MorphingOrb from './morphing-orb';
import AudioSpectrum3D from './audio-spectrum-3d';
import AuroraWaves from './aurora-waves';
import SpiralGalaxyDistort from './spiral-galaxy-distort';
import HoneycombFlow from './honeycomb-flow';
import WaterRippleMesh from './water-ripple-mesh';
import TopologyMorph from './topology-morph';
import MagneticFieldCursor from './magnetic-field-cursor';
import StringVibration from './string-vibration';
import JellyBlob from './jelly-blob';
import QuantumParticleCloud from './quantum-particle-cloud';
import WebSilkShooter from './web-silk-shooter';
import FireBurn from './fire-burn';
import BinaryRain from './binary-rain';
import WireframeTunnel from './wireframe-tunnel';
import GraphNetworkPulse from './graph-network-pulse';
import SpirographRainbow from './spirograph-rainbow';
import LavaLamp from './lava-lamp';
import CrystalLatticeShimmer from './crystal-lattice-shimmer';
import WarpDriveStars from './warp-drive-stars';
import FlagWave from './flag-wave';
import SpiralHypnotic from './spiral-hypnotic';
import NeonGridPerspective from './neon-grid-perspective';
import BlackHole from './black-hole';
import PhosphorTrace from './phosphor-trace';
import MandelbrotExplorer from './mandelbrot-explorer';
import EtherealWisp from './ethereal-wisp';
import VectorPortrait from './vector-portrait';
import QuantumFoam from './quantum-foam';
import TornadoVortex from './tornado-vortex';
import ElasticCursor from './elastic-cursor';
import GalaxyCluster from './galaxy-cluster';
import CellularMitosis from './cellular-mitosis';

const COMPONENTS = [
  { name: 'Magnetic Flux Field', component: MagneticFluxField, category: 'Particles' },
  { name: 'Plasma Orb', component: PlasmaOrb, category: 'Orbs' },
  { name: 'Quantum Lattice Waves', component: QuantumLatticeWaves, category: 'Grids' },
  { name: 'Audio Wave Sculptor', component: AudioWaveSculptor, category: 'Waves' },
  { name: 'DNA Helix Stream', component: DNAHelixStream, category: 'Biology' },
  { name: 'Galaxy Spiral', component: GalaxySpiral, category: 'Space' },
  { name: 'Lightning Fractal', component: LightningFractal, category: 'Elements' },
  { name: 'Metaball Blobs', component: MetaballBlobs, category: 'Fluids' },
  { name: 'Voronoi Tessellation', component: VoronoiTessellation, category: 'Geometry' },
  { name: 'Neon Tunnel', component: NeonTunnel, category: 'Space' },
  { name: 'Liquid Mercury', component: LiquidMercury, category: 'Fluids' },
  { name: 'Kaleidoscope Symmetry', component: KaleidoscopeSymmetry, category: 'Patterns' },
  { name: 'Constellation Mapper', component: ConstellationMapper, category: 'Network' },
  { name: 'Reaction Diffusion Flow', component: ReactionDiffusionFlow, category: 'Simulation' },
  { name: 'Ribbon Follower', component: RibbonFollower, category: 'Trails' },
  { name: 'Cellular Automata Life', component: CellularAutomataLife, category: 'Simulation' },
  { name: 'Boids Flocking', component: BoidsFlocking, category: 'Biology' },
  { name: 'Flow Field Paint', component: FlowFieldPaint, category: 'Fields' },
  { name: 'Smoke Cursor Trail', component: SmokeCursorTrail, category: 'Interactive' },
  { name: 'Perlin Noise Terrain', component: PerlinNoiseTerrain, category: 'Terrain' },
  { name: 'Gravity Orbits', component: GravityOrbits, category: 'Physics' },
  { name: 'Isometric Cube March', component: IsometricCubeMarch, category: '3D' },
  { name: 'Lissajous Orbiter', component: LissajousOrbiter, category: 'Geometry' },
  { name: 'Paper Folding Grid', component: PaperFoldingGrid, category: 'Texture' },
  { name: 'Laser Grid Shooter', component: LaserGridShooter, category: 'Retro' },
  { name: 'Pixel Dissolve Rebuild', component: PixelDissolveRebuild, category: 'Pixel' },
  { name: 'Ripple Pond', component: RipplePond, category: 'Interactive' },
  { name: 'Spectrum Analyzer', component: SpectrumAnalyzer, category: 'Audio' },
  { name: 'Strange Attractor', component: StrangeAttractor, category: 'Math' },
  { name: 'Particles Text Warp', component: ParticlesTextWarp, category: 'Text' },
  { name: 'Vector Field Arrow', component: VectorFieldArrow, category: 'Fields' },
  { name: 'Ribbon Wind Tunnel', component: RibbonWindTunnel, category: 'Waves' },
  { name: 'Morphing Orb', component: MorphingOrb, category: 'Orbs' },
  { name: 'Audio Spectrum 3D', component: AudioSpectrum3D, category: 'Audio' },
  { name: 'Aurora Waves', component: AuroraWaves, category: 'Nature' },
  { name: 'Spiral Galaxy Distort', component: SpiralGalaxyDistort, category: 'Space' },
  { name: 'Honeycomb Flow', component: HoneycombFlow, category: 'Geometry' },
  { name: 'Water Ripple Mesh', component: WaterRippleMesh, category: 'Water' },
  { name: 'Topology Morph', component: TopologyMorph, category: '3D' },
  { name: 'Magnetic Field Cursor', component: MagneticFieldCursor, category: 'Interactive' },
  { name: 'String Vibration', component: StringVibration, category: 'Physics' },
  { name: 'Jelly Blob', component: JellyBlob, category: 'Orbs' },
  { name: 'Quantum Particle Cloud', component: QuantumParticleCloud, category: 'Quantum' },
  { name: 'Web Silk Shooter', component: WebSilkShooter, category: 'Interactive' },
  { name: 'Fire Burn', component: FireBurn, category: 'Elements' },
  { name: 'Binary Rain', component: BinaryRain, category: 'Retro' },
  { name: 'Wireframe Tunnel', component: WireframeTunnel, category: '3D' },
  { name: 'Graph Network Pulse', component: GraphNetworkPulse, category: 'Network' },
  { name: 'Spirograph Rainbow', component: SpirographRainbow, category: 'Patterns' },
  { name: 'Lava Lamp', component: LavaLamp, category: 'Fluids' },
  { name: 'Crystal Lattice Shimmer', component: CrystalLatticeShimmer, category: 'Grids' },
  { name: 'Warp Drive Stars', component: WarpDriveStars, category: 'Space' },
  { name: 'Flag Wave', component: FlagWave, category: 'Waves' },
  { name: 'Spiral Hypnotic', component: SpiralHypnotic, category: 'Patterns' },
  { name: 'Neon Grid Perspective', component: NeonGridPerspective, category: 'Retro' },
  { name: 'Black Hole', component: BlackHole, category: 'Space' },
  { name: 'Phosphor Trace', component: PhosphorTrace, category: 'Trails' },
  { name: 'Mandelbrot Explorer', component: MandelbrotExplorer, category: 'Math' },
  { name: 'Ethereal Wisp', component: EtherealWisp, category: 'Waves' },
  { name: 'Vector Portrait', component: VectorPortrait, category: 'Geometry' },
  { name: 'Quantum Foam', component: QuantumFoam, category: 'Quantum' },
  { name: 'Tornado Vortex', component: TornadoVortex, category: 'Elements' },
  { name: 'Elastic Cursor', component: ElasticCursor, category: 'Interactive' },
  { name: 'Galaxy Cluster', component: GalaxyCluster, category: 'Space' },
  { name: 'Cellular Mitosis', component: CellularMitosis, category: 'Biology' },
];

const CATEGORIES = ['All', 'Particles', 'Orbs', 'Grids', 'Waves', 'Biology', 'Space', 'Elements', 'Fluids', 'Geometry', 'Patterns', 'Network', 'Simulation', 'Trails', 'Fields', 'Interactive', 'Terrain', 'Physics', '3D', 'Texture', 'Retro', 'Pixel', 'Audio', 'Math', 'Text', 'Nature', 'Water', 'Quantum'];

export default function KineticCollectionPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const filtered = activeCategory === 'All'
    ? COMPONENTS
    : COMPONENTS.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter">KINETIC COLLECTION</h1>
            <p className="text-xs font-mono text-neutral-500 mt-1">
              {COMPONENTS.length} animated components · Canvas 2D
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span className="px-2 py-1 rounded bg-white/5">CURSOR: HOVER</span>
            <span className="px-2 py-1 rounded bg-white/5">CLICK: INTERACT</span>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-white/5">
          <div className="flex gap-1 px-6 py-2 max-w-7xl mx-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                  }`}
              >
                {cat} {cat !== 'All' && (
                  <span className="opacity-50 ml-1">
                    {COMPONENTS.filter(c => c.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp, idx) => {
            const Component = comp.component;
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={comp.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group relative aspect-video rounded-lg overflow-hidden border border-white/5 bg-neutral-900 cursor-pointer"
              >
                <Component />

                <div
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'
                    } bg-gradient-to-t from-black/80 via-black/20 to-transparent`}
                />

                <div
                  className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${isHovered ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white drop-shadow-lg">
                        {comp.name}
                      </h3>
                      <p className="text-[10px] font-mono text-white/60 mt-0.5">
                        {comp.category}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {isHovered && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur text-[10px] font-mono text-white">
                    HOVER
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="mt-16 pt-8 border-t border-white/5 text-center text-xs font-mono text-neutral-500">
          <p>EACH COMPONENT BUILT WITH RAW CANVAS 2D · NO HEAVY LIBRARIES</p>
          <p className="mt-1">MOVE & INTERACT WITH EACH CARD · TAP COMPONENTS TO POKE</p>
        </footer>
      </main>
    </div>
  );
}
