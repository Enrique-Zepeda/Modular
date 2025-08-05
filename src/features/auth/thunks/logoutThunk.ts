import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { clearUser } from "../slices/authSlice";
import toast from "react-hot-toast";

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    await supabase.auth.signOut();
    dispatch(clearUser());
    toast.success("Signed out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Failed to sign out");
  }
};
