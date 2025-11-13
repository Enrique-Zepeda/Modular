import { useAppSelector, useAppDispatch } from "@/hooks/useStore";
import { toggleTheme } from "@/features/theme/slices/themeSlice";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";

export function AppearanceCard() {
  const theme = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  const isDark = theme === "dark";

  return (
    <div className="space-y-6 sm:space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 p-4 sm:p-8 rounded-xl sm:rounded-2xl glass-effect border bg-slate-50/50 dark:bg-transparent border-slate-200 dark:border-primary/10 premium-hover">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-3 sm:p-4 rounded-xl glass-effect border border-primary/20 animate-pulse-glow">
            {isDark ? (
              <Moon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
            ) : (
              <Sun className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
            )}
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="theme-toggle" className="text-base sm:text-xl font-bold cursor-pointer">
              Tema {isDark ? "oscuro" : "claro"}
            </Label>
            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed text-pretty">
              {isDark
                ? "Interfaz oscura premium para reducir la fatiga visual"
                : "Interfaz clara y brillante para mejor visibilidad"}
            </p>
          </div>
        </div>

        <div className="flex justify-end sm:block">
          <Switch
            id="theme-toggle"
            checked={isDark}
            onCheckedChange={() => dispatch(toggleTheme())}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300 data-[state=unchecked]:ring-1 data-[state=unchecked]:ring-slate-400/50 dark:data-[state=unchecked]:bg-slate-700 scale-110 sm:scale-125 premium-hover"
          />
        </div>
      </div>
      <ThemeSelector />
    </div>
  );
}
