import type { AppDispatch } from "../../../app/store";
import { supabase } from "../../../lib/supabase/client";
import { setUser, clearUser, setLoading } from "../slices/authSlice";
import Swal from "sweetalert2";

export const loginUser = (email: string, password: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  dispatch(setLoading(false));

  if (error) {
    Swal.fire("Error", error.message, "error");
  } else {
    dispatch(setUser(data.user?.email || ""));
  }
};

export const registerUser = (email: string, password: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  const { error } = await supabase.auth.signUp({ email, password });
  dispatch(setLoading(false));

  if (error) {
    Swal.fire("Error", error.message, "error");
  } else {
    Swal.fire("Registrado", "Revisa tu correo para verificar la cuenta", "success");
  }
};

export const logoutUser = () => async (dispatch: AppDispatch) => {
  await supabase.auth.signOut();
  dispatch(clearUser());
};

export const checkAuthSession = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  dispatch(setLoading(false));

  if (error) {
    console.error("Error checking session:", error);
    dispatch(clearUser());
  } else if (session?.user) {
    dispatch(setUser(session.user.email || ""));
  } else {
    dispatch(clearUser());
  }
};
