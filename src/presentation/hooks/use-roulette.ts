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

const SPIN_INTERVAL = 40;
const INITIAL_SLOW_INTERVAL = 120; // 止めるボタン押下後の初期速度
const TOTAL_DECELERATION_STEPS = 10; // 減速ステップ数
const MAX_INTERVAL = 450; // 最終停止時の間隔

// easeOutQuart イージング関数: 1 - (1 - x)^4
const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

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
    let step = 0;

    const decelerate = () => {
      step++;

      // easeOutQuart イージングを使用した減速曲線
      // progress: 0 → 1 に向かって滑らかに変化（4次関数で減速）
      const normalizedProgress = Math.min(step / TOTAL_DECELERATION_STEPS, 1);
      const easedProgress = easeOutQuart(normalizedProgress);
      const interval = INITIAL_SLOW_INTERVAL +
        (MAX_INTERVAL - INITIAL_SLOW_INTERVAL) * easedProgress;

      if (step >= TOTAL_DECELERATION_STEPS) {
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
