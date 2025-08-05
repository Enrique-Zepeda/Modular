// src/features/auth/thunks/resetPasswordThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase/client";
import { setRecoveryMode } from "../slices/authSlice";

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ password }: { password: string }, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return rejectWithValue(error.message);
    await supabase.auth.signOut();
    dispatch(setRecoveryMode(false));
    return "success";
  }
);
