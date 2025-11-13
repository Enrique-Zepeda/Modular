import { Card, CardContent } from "@/components/ui/card";
import { User, Target, Clock } from "lucide-react";

export function RoutineStats({
  nivel,
  objetivo,
  duracion,
}: {
  nivel?: string | null;
  objetivo?: string | null;
  duracion?: number | null;
}) {
  return (
    <div
      className="
      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
      gap-4 sm:gap-6 items-stretch min-w-0
    "
    >
      {/* Card 1: Nivel */}
      <Card className="relative overflow-hidden border-2 border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-primary/5 group">
        {/* overlay decorativo sin bloquear interacciones */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nivel</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold capitalize text-balance">{nivel || "No especificado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Objetivo */}
      <Card className="relative overflow-hidden border-2 border-border/60 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-purple-500/5 group">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 shrink-0">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Objetivo</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold capitalize text-balance">
                {objetivo || "No especificado"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Duración */}
      <Card className="relative overflow-hidden border-2 border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-primary/5 group">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 shrink-0">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Duración</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-balance">
                {duracion ? `${duracion} min` : "No especificada"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
