"use client";

import { useMemo } from "react";
import { Spot } from "@/domain/entities/spot";
import { RouletteButton } from "@/presentation/components/roulette-button";
import { RouletteAnimation } from "@/presentation/components/roulette-animation";
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

  return (
    <main className="flex flex-col items-center gap-10">
      {state.phase === "idle" && <RouletteButton onClick={spin} />}

      {state.phase === "spinning" && (
        <>
          <RouletteAnimation currentSpot={state.displaySpot} />
          <StopButton onClick={stop} />
        </>
      )}

      {state.phase === "stopping" && (
        <RouletteAnimation currentSpot={state.displaySpot} />
      )}

      {state.phase === "result" && (
        <ResultDisplay
          spot={state.spot}
          onRetry={() => {
            reset();
            spin();
          }}
        />
      )}
    </main>
  );
}
