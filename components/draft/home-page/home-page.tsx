import { BlockVaultGallery } from "../component/component"
import MonochromeRoadmap from "./components/monochrome-roadmap/monochrome-roadmap"
import HydraulicArm from "../hairline-iso/src/components/hydraulic-arm/hydraulic-arm"

export default function Page() {
  return (
    // <main className="flex min-h-screen w-screen items-center justify-center p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-950">
    <div className="w-full h-full">
      {/* <BlockVaultGallery /> */}
      <MonochromeRoadmap />
    </div>
    // </main>
  )
}
