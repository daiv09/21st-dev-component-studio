import FlipQuoteCard from "./submitted/FlipQuoteCard";
import CurlyWavePoster from "./submitted/CurlyWavePoster"
import WavingHandPoster from "./submitted/WavingHandPoster";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-[#ECECEC] dark:bg-[#05070E] transition-colors duration-500 flex flex-col items-center justify-center p-4 sm:p-8">
      <WavingHandPoster />
    </main>
  );
}