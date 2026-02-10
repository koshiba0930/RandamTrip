import { fetchSpots } from "@/infrastructure/microcms/client";
import { SPOTS } from "@/data/spots";
import { RouletteContainer } from "@/presentation/components/roulette-container";

export default async function Home() {
  let spots = [...SPOTS];

  try {
    const fetched = await fetchSpots();
    if (fetched.length > 0) {
      spots = fetched;
    }
  } catch {
    // microCMS unavailable — fall back to static data
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <header className="mb-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-400 sm:text-3xl">
          Random Trip
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          次の旅先、運命に委ねてみませんか？
        </p>
      </header>

      <RouletteContainer spots={spots} />
    </div>
  );
}
