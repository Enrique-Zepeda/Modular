import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
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
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader className="gap-3 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-balance">{title}</CardTitle>
          <div className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="tabular-nums font-semibold">{formatElapsed(elapsed)}</span>
          </div>
        </div>
        {description && <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{description}</p>}
      </CardHeader>
    </Card>
  );
}
