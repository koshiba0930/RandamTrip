"use client";

import { useMemo } from "react";
import { Spot } from "@/domain/entities/spot";
import { RouletteButton } from "@/presentation/components/roulette-button";
import { JapanMap } from "@/presentation/components/japan-map";
import { ResultDisplay } from "@/presentation/components/result-display";
import { StopButton } from "@/presentation/components/stop-button";
import { useRoulette } from "@/presentation/hooks/use-roulette";
import { InMemorySpotRepository } from "@/infrastructure/repositories/in-memory-spot-repository";

type Props = {
  spots: Spot[];
};

export function RouletteContainer({ spots }: Props) {
  const repository = useMemo(() => new InMemorySpotRepository(spots), [spots]);
  const { state, spin, stop, reset } = useRoulette(repository);

  const isAnimating = state.phase === "spinning" || state.phase === "stopping";
  const highlightedPrefecture =
    state.phase === "result" ? state.spot.prefecture : undefined;

  const getCurrentSpot = (): Spot | null => {
    if (state.phase === "result") return state.spot;
    if (state.phase === "spinning" || state.phase === "stopping")
      return state.displaySpot;
    return null;
  };

  const currentSpot = getCurrentSpot();

  return (
    <main className="flex flex-col items-center gap-10 w-full">
      <JapanMap
        highlightedPrefecture={highlightedPrefecture}
        isAnimating={isAnimating}
      />

      <div className="flex flex-col items-center gap-6 min-h-[500px] justify-start">
        {state.phase === "idle" && (
          <div className="flex flex-col items-center">
            <RouletteButton onClick={spin} />
          </div>
        )}

        {state.phase === "spinning" && (
          <div className="flex flex-col items-center">
            <StopButton onClick={stop} />
          </div>
        )}

        {state.phase === "stopping" && (
          <div className="flex flex-col items-center h-6">
            {/* スペース確保のための空div */}
          </div>
        )}

        {currentSpot && state.phase === "result" && (
          <ResultDisplay
            spot={currentSpot}
            onRetry={() => {
              reset();
              spin();
            }}
            isResult={true}
          />
        )}
      </div>
    </main>
  );
}
