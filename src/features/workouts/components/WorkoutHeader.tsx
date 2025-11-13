import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, Zap } from "lucide-react";
import { formatElapsed } from "../utils/time";

export function WorkoutHeader({
  title,
  description,
  elapsed,
}: {
  title: string;
  description?: string | null;
  elapsed: number;
}) {
  return (
    <Card className="rounded-2xl shadow-lg border border-border/50 bg-card/80 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur-sm">
      <CardHeader className="p-4 sm:p-6 md:p-8">
        {/* Mobile-first: stack; en md+ distribuye título+meta vs timer */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold leading-tight text-balance">{title}</CardTitle>

            {/* Chips compactas y con wrap en móvil */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">Entrenamiento en vivo</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Modo activo</span>
              </div>
            </div>

            {description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty max-w-prose md:max-w-3xl bg-muted/30 rounded-lg p-3 border">
                {description}
              </p>
            )}
          </div>

          {/* Timer compacto en móvil, pill más grande en desktop */}
          <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-4 shadow-sm md:self-start shrink-0">
            <Clock className="h-5 w-5 text-primary" />
            <span className="tabular-nums font-bold text-primary tracking-tight" aria-live="polite">
              {formatElapsed(elapsed)}
            </span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
