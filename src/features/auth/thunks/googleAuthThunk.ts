import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { setLoading } from "../slices/authSlice";
import toast from "react-hot-toast";

export const loginWithGoogle = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Failed to sign in with Google");
      throw error;
    }
  } catch (error) {
    console.error("Google login error:", error);
    dispatch(setLoading(false));
  }
};
