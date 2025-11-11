import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WeightUnit } from "@/lib/weight";

const LOCAL_KEY = "app_weight_unit";

function getInitialUnit(): WeightUnit {
  if (typeof window === "undefined") return "kg";
  const stored = window.localStorage.getItem(LOCAL_KEY);
  if (stored === "kg" || stored === "lbs") return stored;
  return "kg";
}

type PreferencesState = {
  weightUnit: WeightUnit;
};

const initialState: PreferencesState = {
  weightUnit: getInitialUnit(),
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setWeightUnit(state, action: PayloadAction<WeightUnit>) {
      state.weightUnit = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCAL_KEY, action.payload);
      }
    },
  },
});

export const { setWeightUnit } = preferencesSlice.actions;
export default preferencesSlice.reducer;
