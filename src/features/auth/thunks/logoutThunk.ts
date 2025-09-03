// src/features/auth/thunks/logoutThunk.ts
import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { clearUser } from "../slices/authSlice";
import toast from "react-hot-toast";
import { rutinasApi } from "@/features/rutinas/api/rutinasApi";

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    await supabase.auth.signOut();

    // 🔥 limpia TODO el caché de RTK Query para evitar datos del usuario anterior
    dispatch((rutinasApi as any).util.resetApiState());

    dispatch(clearUser());
    toast.success("Sesión cerrada");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("No se pudo cerrar sesión");
  }
};
