import { useCallback } from "react";
import { setTheme, toggleTheme } from "../slices/themeSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";

export function useTheme() {
  const theme = useAppSelector((state) => state.theme || "light");
  const dispatch = useAppDispatch();

  const set = useCallback(
    (t: "light" | "dark") => {
      dispatch(setTheme(t));
    },
    [dispatch]
  );

  const toggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  return {
    theme,
    setTheme: set,
    toggleTheme: toggle,
  };
}
