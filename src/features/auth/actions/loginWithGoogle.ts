import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { setLoading } from "../slices/authSlice";
import toast from "react-hot-toast";

export const loginWithGoogle = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    // pequeña pista para depurar (no es estrictamente necesario)
    try {
      sessionStorage.setItem("__oauth_provider", "google");
    } catch {}

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("No se pudo iniciar sesión con Google.");
      throw error;
    }
    // No hacemos setLoading(false) aquí porque habrá redirección.
  } catch (error) {
    console.error("Google login error:", error);
    dispatch(setLoading(false));
  }
};
