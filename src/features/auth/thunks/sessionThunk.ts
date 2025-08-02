import type { AppDispatch } from "@/app/store";
import { supabase } from "@/lib/supabase/client";
import { setLoading } from "../slices/authSlice";
import { clearUser, setUser } from "../slices/authSlice";

export const checkAuthSession = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error checking session:", error);
      dispatch(clearUser());
    } else if (session?.user) {
      dispatch(setUser(session.user.email || ""));
    } else {
      dispatch(clearUser());
    }
  } catch (error) {
    console.error("Session check error:", error);
    dispatch(clearUser());
  } finally {
    dispatch(setLoading(false));
  }
};
