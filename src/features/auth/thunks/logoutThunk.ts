import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { clearUser } from "../slices/authSlice";
import toast from "react-hot-toast";

// Importa todas tus APIs de RTK Query
import { rutinasApi } from "@/features/routines/api/rutinasApi";
import { dashboardApi } from "@/features/dashboard/api/dashboardApi";
import { workoutsApi } from "@/features/workouts/api/workoutsApi";
import { exercisesApi } from "@/features/exercises/api/exercisesApi";

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    await supabase.auth.signOut();

    // Limpia TODOS los caches de RTK Query (evita fugas entre usuarios)
    dispatch(rutinasApi.util.resetApiState());
    dispatch(dashboardApi.util.resetApiState());
    dispatch(workoutsApi.util.resetApiState());
    dispatch(exercisesApi.util.resetApiState());

    // Limpia auth
    dispatch(clearUser());
    toast.success("Sesión cerrada");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("No se pudo cerrar sesión");
  }
};
