import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Edit, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RoutineDetailHeader({
  title,
  description,
  onDelete,
  deleting,
  routineId,
}: {
  title: string;
  description?: string | null;
  onDelete: () => void;
  deleting: boolean;
  routineId?: number;
}) {
  const navigate = useNavigate();

  const handleEditRoutine = () => {
    if (routineId) {
      navigate(`/dashboard/routines/${routineId}/edit`, { replace: true });
    }
  };

  return (
    <div
      className="
      relative overflow-hidden rounded-3xl
      border-2 border-primary/20
      bg-gradient-to-br from-primary/10 via-purple-500/5 to-background
      p-6 md:p-8 shadow-2xl
    "
    >
      {/* Overlays decorativos, no bloquean interacciones */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />

      {/* Layout: columna en móvil, fila en desktop */}
      <div className="relative flex flex-col md:flex-row items-start md:items-start justify-between gap-5 md:gap-6">
        {/* Izquierda: back + textos */}
        <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mt-0.5 md:mt-1 hover:bg-primary/10 transition-colors rounded-lg"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 space-y-2.5 md:space-y-3 min-w-0">
            <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30 shrink-0">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h1
                className="
                text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-balance
                bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent
                truncate
              "
                title={title}
              >
                {title}
              </h1>
            </div>

            {description && (
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-prose md:max-w-3xl font-medium text-pretty">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Derecha: acciones (full-width en móvil, alineadas a la derecha en desktop) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0 md:justify-end">
          <Button
            onClick={handleEditRoutine}
            disabled={!routineId}
            size="default"
            className="
            h-11 w-full sm:w-auto md:min-w-[140px]
            bg-gradient-to-r from-primary to-purple-600
            hover:from-primary/90 hover:to-purple-600/90
            shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl
          "
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Rutina
          </Button>

          <Button
            variant="destructive"
            size="default"
            onClick={onDelete}
            disabled={deleting}
            className="h-11 w-full sm:w-auto md:min-w-[120px] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
