import { useAppSelector, useAppDispatch } from "@/hooks/useStore";
import { toggleTheme } from "@/features/theme/slices/themeSlice";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";

export function AppearanceCard() {
  const theme = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  const isDark = theme === "dark";

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between p-8 rounded-2xl glass-effect border border-primary/10 premium-hover">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-xl glass-effect border border-primary/20 animate-pulse-glow">
            {isDark ? <Moon className="h-7 w-7 text-primary" /> : <Sun className="h-7 w-7 text-primary" />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme-toggle" className="text-xl font-bold cursor-pointer">
              Tema {isDark ? "oscuro" : "claro"}
            </Label>
            <p className="text-base text-muted-foreground leading-relaxed">
              {isDark
                ? "Interfaz oscura premium para reducir la fatiga visual"
                : "Interfaz clara y brillante para mejor visibilidad"}
            </p>
          </div>
        </div>

        <Switch
          id="theme-toggle"
          checked={isDark}
          onCheckedChange={() => dispatch(toggleTheme())}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted scale-125 premium-hover"
        />
      </div>
    </div>
  );
}
