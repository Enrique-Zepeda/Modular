import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGetRutinaByIdQuery } from "@/features/routines/api/rutinasApi";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";

import { cn } from "@/lib/utils";
import {
  finishWorkoutSession,
  startWorkoutSession,
  updateSessionDuration,
} from "@/features/workouts/store/workoutLogSlice";
import { ExerciseLogCard, WorkoutHeader, WorkoutLibraryPanel } from "@/features/workouts/components";

export function LogWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: routine, isLoading } = useGetRutinaByIdQuery(Number(id));
  const { currentSession, isLogging } = useAppSelector((state) => state.workoutLog);

  const [showLibrary, setShowLibrary] = useState(false);
  const [startTime] = useState(Date.now());

  // Update duration every second
  useEffect(() => {
    if (!isLogging) return;

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      dispatch(updateSessionDuration(duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLogging, startTime, dispatch]);

  // Start workout session when routine loads
  useEffect(() => {
    if (routine && !currentSession) {
      dispatch(
        startWorkoutSession({
          routineId: routine.id_rutina,
          routineName: routine.nombre,
          exercises: routine.ejercicios || [],
        })
      );
    }
  }, [routine, currentSession, dispatch]);

  const handleFinishWorkout = () => {
    dispatch(finishWorkoutSession());
    navigate("/dashboard/routines");
  };

  const handleBack = () => {
    navigate(`/dashboard/routines/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando rutina...</div>
      </div>
    );
  }

  if (!routine || !currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Rutina no encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto max-w-[min(100%,theme(spacing.7xl))] px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Layout principal: 1 col en móvil, grid 3 cols desde lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Columna principal (lista de ejercicios) */}
          <div className="lg:col-span-2 min-w-0">
            {/* Header sticky con safe-area; mantiene handlers/props */}
            <div className="sticky top-[env(safe-area-inset-top)] z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b lg:border-none">
              <WorkoutHeader
                routineName={currentSession.routineName}
                duration={currentSession.duration}
                volume={currentSession.totalVolume}
                sets={currentSession.totalSets}
                onBack={handleBack}
                onFinish={handleFinishWorkout}
                onToggleLibrary={() => setShowLibrary(!showLibrary)}
              />
            </div>

            {/* Contenido scrollable sin overflow horizontal */}
            <div className="space-y-4 py-4">
              {currentSession.exercises.map((exercise) => (
                <ExerciseLogCard key={exercise.id} exercise={exercise} />
              ))}

              {currentSession.exercises.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mb-4 text-muted-foreground">No hay ejercicios en esta rutina</div>
                  <Button onClick={() => setShowLibrary(true)}>Agregar Ejercicio</Button>
                </div>
              )}
            </div>
          </div>

          {/* Panel de biblioteca en desktop: aparece como 3ra columna solo si está abierto */}
          {showLibrary && (
            <div className="hidden lg:block lg:col-span-1 min-w-0">
              <WorkoutLibraryPanel onClose={() => setShowLibrary(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Panel de biblioteca en móvil: overlay tipo drawer derecho */}
      {showLibrary ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar biblioteca"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setShowLibrary(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[88vw] max-w-sm border-l bg-card shadow-xl">
            <WorkoutLibraryPanel onClose={() => setShowLibrary(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
