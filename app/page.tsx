import { VectorFieldParticles } from "@/components/animated-suite/vector-field-particles"
import { CellularAutomataGrid } from '@/components/animated-suite/cellular-automata-grid';
import { FluidRippleMesh } from "@/components/animated-suite/fluid-ripple-mesh";
import { MagneticSpringMatrix } from "@/components/animated-suite/magnetic-spring-matrix";
import { LissajousCurveGenerator } from "@/components/animated-suite/lissajous-curve-generator";
import { KineticPendulumWave } from "@/components/animated-suite/kinetic-pendulum-wave";
import { StrangeAttractorSystem } from "@/components/animated-suite/strange-attractor-system";
import GithubContributions from "./Github";

export default function Page() {
  return (
    <div id="component-wrapper" className="flex items-center justify-center min-h-screen bg-white dark:bg-black p-8 transition-colors duration-300">
      <GithubContributions />
      {/* <VectorFieldParticles />
      <FluidRippleMesh />
      <MagneticSpringMatrix />
      <LissajousCurveGenerator />
      <KineticPendulumWave />
      <StrangeAttractorSystem /> */}
    </div>
  );
}
