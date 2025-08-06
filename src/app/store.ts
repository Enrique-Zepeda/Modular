import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import themeReducer from "../features/theme/slices/themeSlice";
import rutinasReducer from "../features/rutinas/slices/rutinasSlice";
import { rutinasApi } from "../features/rutinas/api/rutinasApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    rutinas: rutinasReducer,
    [rutinasApi.reducerPath]: rutinasApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rutinasApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
