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
    <main className="flex flex-col items-center gap-10">
      <JapanMap
        highlightedPrefecture={highlightedPrefecture}
        isAnimating={isAnimating}
      />

      {currentSpot && (
        <ResultDisplay
          spot={currentSpot}
          onRetry={() => {
            reset();
            spin();
          }}
          isResult={state.phase === "result"}
        />
      )}

      {state.phase === "idle" && <RouletteButton onClick={spin} />}

      {state.phase === "spinning" && <StopButton onClick={stop} />}
    </main>
  );
}
