import { setWeightUnit } from "@/features/preferences/preferencesSlice";
import type { WeightUnit } from "@/lib/weight";
import { useAppDispatch, useAppSelector } from "./useStore";

export function useWeightUnit() {
  const unit = useAppSelector((s) => s.preferences.weightUnit);
  const dispatch = useAppDispatch();

  function updateUnit(next: WeightUnit) {
    dispatch(setWeightUnit(next));
  }

  return { unit, setUnit: updateUnit };
}
