import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ExitConfirmationDialog } from "@/components/ui/exit-confirmation-dialog";
import { DeleteExerciseDialog } from "@/components/ui/delete-exercise-dialog";
import { useCreateWorkoutSessionMutation } from "@/features/workouts/api/workoutsApi";
import { useGetRutinaByIdQuery } from "@/features/routines/api/rutinasApi";
import type { WorkoutExercise } from "@/features/workouts/types";
import { useStopwatch } from "@/features/workouts/hooks/useStopwatch";
import { useWorkoutEditor, useWorkoutKpis } from "@/features/workouts/hooks";
import { buildInitialWorkoutState, buildWorkoutPayload } from "@/features/workouts/utils";
import {
  ExerciseFinder,
  ExerciseQuickConfigDialog,
  WorkoutExerciseItem,
  WorkoutExerciseList,
  WorkoutHeader,
  WorkoutKpisBar,
} from "@/features/workouts/components";

export default function WorkoutLivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const id_rutina = Number(id);

  const [createWorkout, { isLoading: saving }] = useCreateWorkoutSessionMutation();
  const { data, isLoading, isError } = useGetRutinaByIdQuery(id_rutina, {
    skip: !Number.isFinite(id_rutina) || id_rutina <= 0,
  });

  const {
    workout,
    setFromInitial,
    existingIds,
    deleteDlg,
    setDeleteDlg,
    handleReorder,
    toggleSetDone,
    updateSetField,
    addSet,
    removeSet,
    askDeleteExercise,
    confirmDeleteExercise,
    addExtraExerciseConfigured,
  } = useWorkoutEditor();

  // Seed desde datos
  const initialState = useMemo(() => (data ? buildInitialWorkoutState(data) : null), [data]);
  useEffect(() => {
    if (!workout && initialState) setFromInitial(initialState);
  }, [initialState, workout, setFromInitial]);

  const elapsed = useStopwatch(Boolean(workout));
  const { doneSets, totalVolume, totalSets } = useWorkoutKpis(workout);

  // navegación/salida
  const routinePath = useMemo(
    () => (Number.isFinite(id_rutina) && id_rutina > 0 ? `/dashboard/routines/${id_rutina}` : "/dashboard/routines"),
    [id_rutina]
  );
  const [exitOpen, setExitOpen] = useState(false);
  const handleExitNow = useCallback(() => {
    setExitOpen(false);
    navigate(routinePath, { replace: true });
  }, [navigate, routinePath]);

  const [configDlg, setConfigDlg] = useState<{ open: boolean; exercise: any | null }>({
    open: false,
    exercise: null,
  });

  // Guardado
  const [createError, setCreateError] = useState<string | null>(null);
  const handleFinalizar = useCallback(async () => {
    if (!workout) return;
    const payload = buildWorkoutPayload(workout);
    if (!payload.sets.length) {
      toast.error("No hay sets válidos para guardar.");
      return;
    }
    try {
      setCreateError(null);
      const res: any = await createWorkout(payload).unwrap();
      toast.success(`Entrenamiento guardado #${res.id_sesion}`);
      navigate("/dashboard");
    } catch (e: any) {
      setCreateError(e?.data?.message || e?.message || "Error desconocido");
      toast.error("No se pudo guardar el entrenamiento");
    }
  }, [workout, createWorkout, navigate]);

  return (
    <div className="mx-auto max-w-7xl p-4 space-y-6">
      <WorkoutHeader
        title={workout?.nombre ?? (isLoading ? "Cargando..." : isError ? "Error" : "Entrenamiento")}
        description={workout?.descripcion}
        elapsed={elapsed}
      />

      <WorkoutKpisBar
        doneSets={doneSets}
        totalSets={totalSets}
        totalVolume={totalVolume}
        onExit={() => setExitOpen(true)}
        onFinish={handleFinalizar}
        saving={saving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Workout Exercises */}
        <div className="lg:col-span-2">
          {!isLoading && workout && (
            <WorkoutExerciseList
              exercises={workout.exercises}
              onReorder={(items: WorkoutExercise[]) => handleReorder(items)}
              renderItem={(ex, ei) => (
                <WorkoutExerciseItem
                  ex={ex}
                  ei={ei}
                  onAskDelete={askDeleteExercise}
                  onAddSet={addSet}
                  onUpdateSet={updateSetField}
                  onToggleSet={toggleSetDone}
                  onRemoveSet={removeSet}
                />
              )}
            />
          )}
        </div>

        {/* Right side - Exercise Finder */}
        <div className="lg:col-span-1 space-y-4">
          <ExerciseFinder
            existingIds={existingIds}
            open={true}
            onAdd={(e) => setConfigDlg({ open: true, exercise: e })}
          />
        </div>
      </div>

      <ExitConfirmationDialog open={exitOpen} onOpenChange={setExitOpen} onConfirm={handleExitNow} />
      <DeleteExerciseDialog
        open={deleteDlg.open}
        onOpenChange={(open) => setDeleteDlg((d) => ({ ...d, open }))}
        onConfirm={confirmDeleteExercise}
        exerciseName={deleteDlg.name}
      />
      {createError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{createError}</p>
        </div>
      )}

      <ExerciseQuickConfigDialog
        open={configDlg.open}
        onOpenChange={(open) => setConfigDlg((d) => ({ ...d, open }))}
        exerciseName={configDlg.exercise?.nombre ?? `Ejercicio #${configDlg.exercise?.id ?? ""}`}
        defaults={{ series: 3, reps: 10, kg: 0 }}
        onConfirm={(cfg) => {
          const e = configDlg.exercise;
          if (e) {
            addExtraExerciseConfigured(e, cfg);
            setConfigDlg({ open: false, exercise: null });
          }
        }}
      />
    </div>
  );
}
