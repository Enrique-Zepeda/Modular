import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import themeReducer from "../features/theme/slices/themeSlice";
import rutinasReducer from "../features/routines/slices/rutinasSlice";

// RTK Query APIs
import { rutinasApi } from "../features/routines/api/rutinasApi";
import { exercisesApi } from "../features/exercises/api/exercisesApi";
import { dashboardApi } from "@/features/dashboard/api/dashboardApi";
import { workoutsApi } from "@/features/workouts/api/workoutsApi";
import { profileApi } from "@/features/settings/api/profileApi";

import { setupListeners } from "@reduxjs/toolkit/query";
import { friendsApi } from "@/features/friends/api/friendsApi";
import { friendsFeedApi } from "@/features/friends/api/friendsFeedApi";
import { userProfileApi } from "@/features/profile/api/userProfileApi";

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
    [profileApi.reducerPath]: profileApi.reducer,
    [friendsApi.reducerPath]: friendsApi.reducer,
    [friendsFeedApi.reducerPath]: friendsFeedApi.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      dashboardApi.middleware,
      workoutsApi.middleware,
      rutinasApi.middleware,
      exercisesApi.middleware,
      profileApi.middleware,
      friendsApi.middleware,
      friendsFeedApi.middleware,
      userProfileApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
