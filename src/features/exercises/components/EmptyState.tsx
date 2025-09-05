import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, X } from "lucide-react";

export function EmptyState({ showClear, onClear }: { showClear: boolean; onClear: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
          <Dumbbell className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-3 mb-8">
          <h3 className="text-xl font-semibold">No se encontraron ejercicios</h3>
          <p className="text-muted-foreground max-w-md">
            {showClear
              ? "Intenta ajustar los filtros para encontrar más ejercicios que coincidan con tu búsqueda."
              : "No hay ejercicios disponibles en este momento. Vuelve a intentarlo más tarde."}
          </p>
        </div>
        {showClear && (
          <Button variant="outline" onClick={onClear} className="rounded-full">
            <X className="h-4 w-4 mr-2" /> Limpiar todos los filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
