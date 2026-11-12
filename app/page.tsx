import PosterTextAnimationsShowcase, {
  LayeredDepthText,
  ChaosMatrixText,
  SteppedRibbonText,
  ScribbleCycleStack,
  EditorialMediaText,
} from "./component";

export default function DemoPage() {
  return (
    <main className="min-h-screen w-full bg-[#ECECEC] dark:bg-[#05070E] transition-colors duration-500 flex items-center justify-center p-4 sm:p-8">
      <LayeredDepthText text="CONFIDENCE" />
      {/* <ChaosMatrixText /> */}
      {/* <SteppedRibbonText /> */}
      {/* <ScribbleCycleStack /> */}
      {/* <EditorialMediaText /> */}
    </main>
  );
}
