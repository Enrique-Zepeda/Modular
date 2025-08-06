import { useAppSelector, useAppDispatch } from "@/hooks/useStore";
import { toggleTheme } from "@/features/theme/slices/themeSlice";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";

export default function AppearanceCard() {
  const theme = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDark ? (
            <Moon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="theme-toggle" className="text-base font-medium">
              Tema oscuro
            </Label>
            <p className="text-sm text-muted-foreground">Cambia entre tema claro y oscuro</p>
          </div>
        </div>

        <Switch id="theme-toggle" checked={isDark} onCheckedChange={() => dispatch(toggleTheme())} />
      </div>
    </div>
  );
}
