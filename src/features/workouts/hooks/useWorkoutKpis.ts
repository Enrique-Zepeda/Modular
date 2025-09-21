import { useMemo } from "react";
import type { WorkoutState } from "@/features/workouts/types";

export function useWorkoutKpis(workout: WorkoutState | null) {
  return useMemo(() => {
    const exs = workout?.exercises ?? [];
    let done = 0,
      volume = 0,
      setsCount = 0;
    for (const ex of exs) {
      setsCount += ex.sets.length;
      for (const s of ex.sets) {
        if (s.done) {
          done += 1;
          const kg = parseFloat(s.kg || "0");
          const reps = parseInt(s.reps || "0", 10);
          if (!Number.isNaN(kg) && !Number.isNaN(reps)) volume += kg * reps;
        }
      }
    }
    return { doneSets: done, totalVolume: volume, totalSets: setsCount };
  }, [workout?.exercises]);
}
