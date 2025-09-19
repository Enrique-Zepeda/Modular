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
    <div className="flex h-screen bg-background">
      {/* Main workout area */}
      <div className={cn("flex-1 flex flex-col", showLibrary && "mr-80")}>
        {/* Header */}
        <WorkoutHeader
          routineName={currentSession.routineName}
          duration={currentSession.duration}
          volume={currentSession.totalVolume}
          sets={currentSession.totalSets}
          onBack={handleBack}
          onFinish={handleFinishWorkout}
          onToggleLibrary={() => setShowLibrary(!showLibrary)}
        />

        {/* Workout content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession.exercises.map((exercise) => (
            <ExerciseLogCard key={exercise.id} exercise={exercise} />
          ))}

          {currentSession.exercises.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No hay ejercicios en esta rutina</div>
              <Button onClick={() => setShowLibrary(true)}>Agregar Ejercicio</Button>
            </div>
          )}
        </div>
      </div>

      {/* Library panel */}
      {showLibrary && <WorkoutLibraryPanel onClose={() => setShowLibrary(false)} />}
    </div>
  );
}
