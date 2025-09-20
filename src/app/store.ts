import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import themeReducer from "../features/theme/slices/themeSlice";
import rutinasReducer from "../features/routines/slices/rutinasSlice";

// RTK Query APIs
import { rutinasApi } from "../features/routines/api/rutinasApi";
import { exercisesApi } from "../features/exercises/slices/exercisesSlice"; // <-- IMPORTANTE
import { dashboardApi } from "@/features/dashboard/api/dashboardApi";
import { workoutsApi } from "@/features/workouts/api/workoutsApi";

import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    rutinas: rutinasReducer,

    // RTK Query reducers
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [rutinasApi.reducerPath]: rutinasApi.reducer,
    [exercisesApi.reducerPath]: exercisesApi.reducer,
    [workoutsApi.reducerPath]: workoutsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      dashboardApi.middleware,
      workoutsApi.middleware,
      rutinasApi.middleware,
      exercisesApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
