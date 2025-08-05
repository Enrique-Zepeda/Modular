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
      toast.error("Failed to send reset email");
      throw error;
    }

    toast.success("Password reset link sent to your email");
  } catch (error) {
    console.error("Forgot password error:", error);
  } finally {
    dispatch(setLoading(false));
  }
};
