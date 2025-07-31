import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../features/theme/useTheme";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="outline" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}
