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
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4" />
            <span className="tabular-nums font-medium">{formatElapsed(elapsed)}</span>
          </div>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
    </Card>
  );
}
