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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-2 border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-primary/5 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 border border-primary/30 rounded-xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nivel</p>
              <p className="text-2xl font-bold capitalize mt-1">{nivel || "No especificado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border/60 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-purple-500/5 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Objetivo</p>
              <p className="text-2xl font-bold capitalize mt-1">{objetivo || "No especificado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background to-primary/5 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 border border-primary/30 rounded-xl">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Duración</p>
              <p className="text-2xl font-bold mt-1">{duracion ? `${duracion} min` : "No especificada"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
