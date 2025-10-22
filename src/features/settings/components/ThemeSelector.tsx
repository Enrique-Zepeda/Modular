import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Check, Palette } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { getInitialColorTheme, setColorTheme, AVAILABLE_COLOR_THEMES } from "../../theme/colorTheme";

const THEME_COLORS: Record<string, string> = {
  modern: "#0ea5e9",
  amethyst: "#a855f7",
  blue: "#3b82f6",
  candyland: "#ec4899",
  dark: "#6366f1",
  ghibliStudio: "#10b981",
  green: "#059669",
  kodama: "#22c55e",
  neo: "#8b5cf6",
  notebook: "#f59e0b",
  red: "#ef4444",
  spotify: "#1ed760",
  summer: "#f97316",
  twitter: "#1d9bf0",
  vercel: "#56878c",
  violet: "#7c3aed",
};

const LABELS: Record<string, string> = {
  modern: "Default",
  amethyst: "Amethyst",
  blue: "Blue",
  candyland: "Candyland",
  dark: "Dark",
  ghibliStudio: "Ghibli Studio",
  green: "Green",
  kodama: "Kodama",
  neo: "Neo",
  notebook: "Notebook",
  red: "Red",
  spotify: "Spotify",
  summer: "Summer",
  twitter: "Twitter",
  vercel: "Vercel",
  violet: "Violet",
};

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = React.useState<string>(() => getInitialColorTheme());
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const filteredThemes = AVAILABLE_COLOR_THEMES;

  const handleSelect = (theme: string) => {
    setSelectedTheme(theme);
    setColorTheme(theme as any);
  };

  const handleKeyDown = (e: React.KeyboardEvent, theme: string, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(theme);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, filteredThemes.length - 1);
      setFocusedIndex(nextIndex);
      const nextButton = gridRef.current?.querySelectorAll('[role="button"]')[nextIndex] as HTMLElement;
      nextButton?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      setFocusedIndex(prevIndex);
      const prevButton = gridRef.current?.querySelectorAll('[role="button"]')[prevIndex] as HTMLElement;
      prevButton?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg glass-effect border border-primary/20">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Tema de color</h3>
            <p className="text-sm text-muted-foreground">{filteredThemes.length} temas disponibles</p>
          </div>
        </div>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        role="radiogroup"
        aria-label="Seleccionar tema de color"
      >
        <AnimatePresence mode="popLayout">
          {filteredThemes.map((theme, index) => {
            const isSelected = selectedTheme === theme;
            const themeColor = THEME_COLORS[theme];

            return (
              <motion.div
                key={theme}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  role="button"
                  tabIndex={0}
                  aria-checked={isSelected}
                  aria-label={`Tema ${LABELS[theme]}`}
                  className={`
                    relative p-4 cursor-pointer transition-all duration-200
                    hover:shadow-lg hover:border-primary/30
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                    ${isSelected ? "border-primary border-2 shadow-lg" : "border-border"}
                  `}
                  onClick={() => handleSelect(theme)}
                  onKeyDown={(e) => handleKeyDown(e, theme, index)}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 rounded-full p-1.5 shadow-lg z-10"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}

                  <div className="space-y-3 mb-3" data-theme={theme}>
                    {/* Header with primary color */}
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <div
                        className="h-6 w-6 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: themeColor }}
                      >
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-foreground rounded w-3/4" />
                        <div className="h-1.5 bg-muted-foreground rounded w-1/2" />
                      </div>
                    </div>

                    {/* Card preview */}
                    <div className="bg-card border border-border rounded-md p-2 space-y-2">
                      <div className="h-2 bg-card-foreground/80 rounded w-4/5" />
                      <div className="h-1.5 bg-muted-foreground rounded w-full" />
                      <div className="h-1.5 bg-muted-foreground rounded w-3/4" />
                    </div>

                    {/* Buttons and badges */}
                    <div className="flex gap-1.5 items-center">
                      <div
                        className="h-6 flex-1 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: themeColor }}
                      >
                        <div className="h-1 w-6 bg-white rounded" />
                      </div>
                      <div className="h-6 px-2 bg-secondary rounded-md flex items-center justify-center border border-border">
                        <div className="h-1 w-4 bg-secondary-foreground rounded" />
                      </div>
                    </div>

                    {/* Accent elements */}
                    <div className="flex gap-1">
                      <div className="h-4 px-2 bg-accent rounded flex items-center justify-center flex-1">
                        <div className="h-0.5 w-full bg-accent-foreground rounded" />
                      </div>
                      <div className="h-4 px-2 bg-muted rounded flex items-center justify-center flex-1">
                        <div className="h-0.5 w-full bg-muted-foreground rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: themeColor }}>
                      {LABELS[theme]}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
