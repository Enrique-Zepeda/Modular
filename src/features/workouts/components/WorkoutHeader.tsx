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
      <CardHeader className="gap-6 p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <CardTitle className="text-3xl font-bold text-balance leading-tight">{title}</CardTitle>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty max-w-3xl bg-muted/30 rounded-lg p-3 border">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-lg bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-2xl px-6 py-4 shadow-sm">
            <Clock className="h-5 w-5 text-primary" />
            <span className="tabular-nums font-bold text-primary tracking-tight">{formatElapsed(elapsed)}</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
