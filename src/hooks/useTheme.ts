import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { toggleTheme, setTheme } from "../features/theme/slices/themeSlice";

export const useTheme = () => {
  const theme = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();

  const toggle = () => dispatch(toggleTheme());
  const set = (value: "light" | "dark") => dispatch(setTheme(value));

  return { theme, toggle, set };
};
