import { useCallback } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { setTheme, toggleTheme } from "../../store/slices/themeSlice";

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
