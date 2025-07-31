import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ThemeState = "light" | "dark";

const getInitialTheme = (): ThemeState => {
  const storedTheme = localStorage.getItem("theme") as ThemeState | null;
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  // Usa preferencia del sistema si no hay tema guardado
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

const initialState: ThemeState = getInitialTheme();

// Aplicar la clase inicial al cargar
if (typeof document !== "undefined") {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(initialState);
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeState>) => {
      const newTheme = action.payload;
      localStorage.setItem("theme", newTheme);

      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);

      return newTheme;
    },
    toggleTheme: (state) => {
      const newTheme = state === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);

      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);

      return newTheme;
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
