import { TestimonialCarouselCard } from "./components/interactive/testimonial-carousel-card";

export default function Page() {
  return (
    <main className="relative w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-foreground overflow-hidden">
      {/* Background Decorative Grid pattern & subtle vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-background/40 to-background pointer-events-none" />

      {/* Main Component Wrapper */}
      <div className="relative z-10 w-full max-w-7xl max-h-[75vh] p-4 flex items-center justify-center">
        <TestimonialCarouselCard />
      </div>
    </main>
  );
}
