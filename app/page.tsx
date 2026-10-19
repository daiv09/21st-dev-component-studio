import { IsometricActivityHeatmap } from "../components/submitted/isometric-heatmap";
import { IsometricHexChart } from "../components/submitted/isometric-hex-chart";

export default function Page() {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-neutral-50 p-4 text-neutral-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-50 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl">
                <IsometricActivityHeatmap />
                <IsometricHexChart />
            </div>
        </main>
    );
}