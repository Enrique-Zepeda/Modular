import { Card, CardContent } from "@/components/ui/card";

export function RoutinesSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-live="polite" aria-busy="true">
      {/* Header skeleton: columna en móvil, fila en desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="h-7 sm:h-8 w-40 sm:w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-56 sm:w-80 md:w-96 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-full sm:w-32 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Filtros skeleton: grid responsiva */}
      <Card className="rounded-2xl shadow-sm">
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-md animate-pulse" aria-hidden="true" />
          ))}
        </div>
      </Card>

      {/* Tarjetas skeleton: sin overflow en móvil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-sm h-44 sm:h-48">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-muted rounded-md animate-pulse" />
                <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-1/2 bg-muted rounded-md animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
