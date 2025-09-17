import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoutineDetailHeader, RoutineExercisesSection, RoutineStats } from "@/features/routines/components";
import { useRoutineDetail } from "@/features/routines/hooks";
import { useNavigate, useParams } from "react-router-dom";

export default function RoutineDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading, requireAuth } = useAuth();
  const {
    rutina,
    isLoading,
    error,
    isDeleting,
    isRemoving,
    isSelectorOpen,
    setIsSelectorOpen,
    ejerciciosExistentes,
    handleEjercicioAgregado,
    handleRemoverEjercicio,
    handleEliminarRutina,
  } = useRoutineDetail();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    requireAuth();
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !rutina) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Error al cargar la rutina</h2>
        <p className="text-muted-foreground mb-4">No se pudo cargar la rutina solicitada</p>
        <Button onClick={() => history.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoutineDetailHeader
        title={rutina.nombre ?? "Sin nombre"}
        description={rutina.descripcion ?? "Sin descripción"}
        onDelete={handleEliminarRutina}
        deleting={isDeleting}
        routineId={rutina.id_rutina} // Pasando el ID de la rutina
      />

      <RoutineStats nivel={rutina.nivel_recomendado} objetivo={rutina.objetivo} duracion={rutina.duracion_estimada} />
      <div className="flex gap-2">
        <Button onClick={() => navigate(`/dashboard/workout/${id}`)} className="ml-auto">
          Empezar Entrenamiento
        </Button>
      </div>
      <RoutineExercisesSection
        count={rutina.EjerciciosRutinas.length}
        items={rutina.EjerciciosRutinas.map((er) => ({
          key: `${er.id_rutina}-${er.id_ejercicio}`,
          title: er.Ejercicios?.nombre,
          group: er.Ejercicios?.grupo_muscular,
          description: er.Ejercicios?.descripcion,
          series: er.series ?? 0,
          reps: er.repeticiones ?? 0,
          weight: er.peso_sugerido ?? 0,
          image: er.Ejercicios?.ejemplo ?? undefined,
          onRemove: () => handleRemoverEjercicio(er.id_ejercicio),
        }))}
        isSelectorOpen={isSelectorOpen}
        setIsSelectorOpen={setIsSelectorOpen}
        ejerciciosExistentes={ejerciciosExistentes}
        onAdd={handleEjercicioAgregado}
        removing={isRemoving}
        routineName={rutina.nombre ?? "Rutina"}
      />
    </div>
  );
}
