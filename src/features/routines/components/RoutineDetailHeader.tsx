import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
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
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2 text-base leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <Button onClick={handleEditRoutine} disabled={!routineId} size="default" className="min-w-[140px]">
          <Edit className="h-4 w-4 mr-2" />
          Editar Rutina
        </Button>
        <Button variant="destructive" size="default" onClick={onDelete} disabled={deleting} className="min-w-[120px]">
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </div>
  );
}
