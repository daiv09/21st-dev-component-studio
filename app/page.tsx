
import NeonHelixLoader from "@/hero/1"
import MovingBlocksLoader from "@/hero/loader"
import NeonCubeLoader from "@/hero/cube-loader"
import ElasticDotsLoader from "@/hero/4"
import KineticDotsLoader from "@/hero/5"
import QuantumCloudLoader from "@/hero/6"
import QualityGuidelines from "@/hero/2"

export default function Page() {
  return (
    // 1. Center the component on the screen
    // 1. Center the component on the scr6en
    // 2. Add a subtle background color (bg-zinc-50) so the card stands out
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 bg-zinc-50 dark:bg-zinc-950 p-8">
    {/* Example 1: Standard with Image & Role */}
      {/* <NeonHelixLoader /> */}
      {/* <MovingBlocksLoader /> */}
      {/* <NeonCubeLoader /> */}
      {/* <ElasticDotsLoader /> */}
      {/* <KineticDotsLoader /> */}
      {/* <QuantumCloudLoader /> */}
      <QualityGuidelines />
    </div>
  );
}