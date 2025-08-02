import type { AppDispatch } from "../../../app/store";
import { supabase } from "../../../lib/supabase/client";
import { setUser, clearUser, setLoading } from "../slices/authSlice";
import toast from "react-hot-toast";

export const loginUser = (email: string, password: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let errorMessage = "An error occurred during login";

      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "Invalid email or password";
          break;
        case "Email not confirmed":
          errorMessage = "Please verify your email before signing in";
          break;
        case "Too many requests":
          errorMessage = "Too many login attempts. Please try again later";
          break;
        default:
          errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    }

    dispatch(setUser(data.user?.email || ""));
    toast.success("Welcome back!");
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    dispatch(setLoading(false));
  }
};

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
      let errorMessage = "An error occurred during registration";

      switch (error.message) {
        case "User already registered":
          errorMessage = "An account with this email already exists";
          break;
        case "Password should be at least 6 characters":
          errorMessage = "Password must be at least 6 characters long";
          break;
        default:
          errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    }

    if (data.user && !data.session) {
      toast.success("Please check your email to verify your account");
    } else {
      toast.success("Account created successfully!");
    }
  } catch (error) {
    console.error("Registration error:", error);
  } finally {
    dispatch(setLoading(false));
  }
};

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
