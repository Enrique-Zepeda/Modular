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
    <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background p-8 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mt-1 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
            {description && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl font-medium">{description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <Button
            onClick={handleEditRoutine}
            disabled={!routineId}
            size="default"
            className="min-w-[140px] bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Rutina
          </Button>
          <Button
            variant="destructive"
            size="default"
            onClick={onDelete}
            disabled={deleting}
            className="min-w-[120px] shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
