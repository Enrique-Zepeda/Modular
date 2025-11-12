import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { setLoading } from "../slices/authSlice";
import toast from "react-hot-toast";

export const forgotPassword = (email: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast.error("No se pudo enviar el correo de restablecimiento.");
      throw error;
    }

    toast.success("Enlace de restablecimiento enviado a tu correo.");
  } catch (error) {
    console.error("Forgot password error:", error);
  } finally {
    dispatch(setLoading(false));
  }
};
