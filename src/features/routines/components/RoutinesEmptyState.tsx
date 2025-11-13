import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function RoutinesEmptyState({ hasAny, onCreate }: { hasAny: boolean; onCreate?: () => void }) {
  return (
    <Card
      className="
      rounded-2xl border border-border/60 bg-card/50 shadow-sm overflow-hidden
    "
    >
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 sm:py-16 text-center">
        {/* Ícono */}
        <div className="mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
          <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
        </div>

        {/* Texto */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-balance">
            {hasAny ? "No se encontraron rutinas" : "No tienes rutinas creadas"}
          </h3>
          <p className="mx-auto max-w-prose text-sm sm:text-base text-muted-foreground text-pretty">
            {hasAny ? "Intenta ajustar los filtros de búsqueda" : "Crea tu primera rutina para comenzar a entrenar"}
          </p>
        </div>

        {/* CTA: full width en móvil, compacto en desktop */}
        {!hasAny && (
          <Button asChild onClick={onCreate} className="h-11 w-full sm:w-auto rounded-xl">
            <Link to="/dashboard/routines/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Rutina
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
