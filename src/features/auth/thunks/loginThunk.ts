import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { setUser, setLoading } from "../slices/authSlice";
import toast from "react-hot-toast";

export const loginUser = (email: string, password: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const messageMap: Record<string, string> = {
        "Invalid login credentials": "Correo o contraseña inválidos",
        "Email not confirmed": "Verifica tu correo antes de iniciar sesión",
        "Too many requests": "Demasiados intentos. Intenta más tarde",
      };
      toast.error(messageMap[error.message] || error.message);
      return { success: false };
    }

    dispatch(setUser(data.user?.email ?? ""));
    toast.success("¡Bienvenido de nuevo!");
    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};
