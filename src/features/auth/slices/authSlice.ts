import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isRecoveryMode: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // <- antes estaba false
  isRecoveryMode: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRecoveryMode(state, action: PayloadAction<boolean>) {
      state.isRecoveryMode = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, setRecoveryMode } = authSlice.actions;
export default authSlice.reducer;
