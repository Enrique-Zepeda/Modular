import { Progress } from "@/components/ui/progress";

interface KpiProgressProps {
  done: number;
  total: number;
  className?: string;
}

export function KpiProgress({ done, total, className = "" }: KpiProgressProps) {
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Texto compacto; permite que el bloque se vaya a la 1ª línea */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
        <span className="text-muted-foreground">Progreso:</span>
        <span className="font-semibold tabular-nums text-primary" aria-live="polite">
          {percentage}%
        </span>
      </div>

      {/* Móvil: barra a ancho completo debajo; sm+: ancho controlado */}
      <div className="w-full sm:w-auto sm:min-w-[180px] sm:max-w-48 md:max-w-56">
        <Progress value={percentage} className="h-2.5 sm:h-2 rounded-full bg-muted/40" />
      </div>
    </div>
  );
}
