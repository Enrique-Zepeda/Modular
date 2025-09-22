import { Progress } from "@/components/ui/progress";

interface KpiProgressProps {
  done: number;
  total: number;
  className?: string;
}

export function KpiProgress({ done, total, className = "" }: KpiProgressProps) {
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Progreso:</span>
        <span className="font-semibold tabular-nums text-primary">{percentage}%</span>
      </div>
      <div className="flex-1 max-w-24">
        <Progress value={percentage} className="h-2 bg-muted/40" />
      </div>
    </div>
  );
}
