// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import themeReducer from "../features/theme/slices/themeSlice";
import rutinasReducer from "../features/rutinas/slices/rutinasSlice";

// RTK Query APIs
import { rutinasApi } from "../features/rutinas/api/rutinasApi";
import { exercisesApi } from "../features/exercises/exercisesSlice"; // <-- IMPORTANTE

import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    rutinas: rutinasReducer,

    // RTK Query reducers
    [rutinasApi.reducerPath]: rutinasApi.reducer,
    [exercisesApi.reducerPath]: exercisesApi.reducer, // <-- AÑADIR
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      rutinasApi.middleware,
      exercisesApi.middleware // <-- AÑADIR
    ),
});

setupListeners(store.dispatch); // opcional pero recomendado

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
