import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { setLoading } from "../slices/authSlice";
import toast from "react-hot-toast";

export const registerUser = (email: string, password: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const messageMap: Record<string, string> = {
        "User already registered": "Este correo ya está registrado",
        "Password should be at least 6 characters": "La contraseña debe tener mínimo 6 caracteres",
      };
      toast.error(messageMap[error.message] || error.message);
      throw error;
    }

    if (data.user && !data.session) {
      toast.success("Revisa tu correo para verificar la cuenta");
    } else {
      toast.success("¡Cuenta creada exitosamente!");
    }
  } catch (err) {
    console.error("Register error:", err);
  } finally {
    dispatch(setLoading(false));
  }
};
