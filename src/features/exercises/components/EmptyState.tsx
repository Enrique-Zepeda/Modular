import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, X } from "lucide-react";

export function EmptyState({ showClear, onClear }: { showClear: boolean; onClear: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      {/* Mobile-first: menos padding vertical y botón full-width; desktop recupera amplitud */}
      <CardContent className="flex flex-col items-center justify-center gap-6 py-12 sm:py-20 px-4 sm:px-6 text-center">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Dumbbell className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>

        <div className="space-y-2 sm:space-y-3 max-w-md">
          <h3 className="text-lg sm:text-xl font-semibold">No se encontraron ejercicios</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            {showClear
              ? "Intenta ajustar los filtros para encontrar más ejercicios que coincidan con tu búsqueda."
              : "No hay ejercicios disponibles en este momento. Vuelve a intentarlo más tarde."}
          </p>
        </div>

        {showClear && (
          <Button variant="outline" onClick={onClear} className="rounded-full w-full sm:w-auto h-11 px-5">
            <span className="inline-flex items-center justify-center">
              <X className="h-4 w-4 mr-2" /> Limpiar todos los filtros
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
