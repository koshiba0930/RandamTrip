"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spot } from "@/domain/entities/spot";
import { SelectRandomSpotUseCase } from "@/application/usecases/select-random-spot";
import { SpotRepository } from "@/domain/repositories/spot-repository";

type RouletteState =
  | { phase: "idle" }
  | { phase: "spinning"; displaySpot: Spot }
  | { phase: "stopping"; displaySpot: Spot }
  | { phase: "result"; spot: Spot };

const SPIN_INTERVAL = 50;
const DECELERATION = 1.3;
const MAX_INTERVAL = 500;

export function useRoulette(repository: SpotRepository) {
  const [state, setState] = useState<RouletteState>({ phase: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const useCase = useRef(new SelectRandomSpotUseCase(repository));
  const allSpots = useRef(repository.getAll());

  const getRandomDisplaySpot = useCallback((): Spot => {
    const spots = allSpots.current;
    return spots[Math.floor(Math.random() * spots.length)];
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const spin = useCallback(() => {
    clearTimer();
    setState({ phase: "spinning", displaySpot: getRandomDisplaySpot() });

    const tick = () => {
      setState({ phase: "spinning", displaySpot: getRandomDisplaySpot() });
      timerRef.current = setTimeout(tick, SPIN_INTERVAL);
    };

    timerRef.current = setTimeout(tick, SPIN_INTERVAL);
  }, [getRandomDisplaySpot, clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    const finalSpot = useCase.current.execute();
    let interval = SPIN_INTERVAL;

    const decelerate = () => {
      interval = interval * DECELERATION;

      if (interval >= MAX_INTERVAL) {
        setState({ phase: "result", spot: finalSpot });
        return;
      }

      setState({ phase: "stopping", displaySpot: getRandomDisplaySpot() });
      timerRef.current = setTimeout(decelerate, interval);
    };

    decelerate();
  }, [getRandomDisplaySpot, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState({ phase: "idle" });
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { state, spin, stop, reset };
}
