import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function RoutinesEmptyState({ hasAny, onCreate }: { hasAny: boolean; onCreate?: () => void }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-lg font-semibold">
            {hasAny ? "No se encontraron rutinas" : "No tienes rutinas creadas"}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {hasAny ? "Intenta ajustar los filtros de búsqueda" : "Crea tu primera rutina para comenzar a entrenar"}
          </p>
        </div>
        {!hasAny && (
          <Button asChild className="rounded-xl" onClick={onCreate}>
            <Link to="/dashboard/routines/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Rutina
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
