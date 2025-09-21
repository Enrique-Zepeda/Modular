import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ExitConfirmationDialog } from "@/components/ui/exit-confirmation-dialog";
import { DeleteExerciseDialog } from "@/components/ui/delete-exercise-dialog";
import { useCreateWorkoutSessionMutation } from "@/features/workouts/api/workoutsApi";
import { useGetRutinaByIdQuery } from "@/features/routines/api/rutinasApi";
import type { WorkoutExercise, WorkoutState } from "@/features/workouts/types";
import { useStopwatch } from "@/features/workouts/hooks/useStopwatch";
import { buildInitialWorkoutState } from "@/features/workouts/utils/buildInitialWorkoutState";
import {
  ExerciseFinder,
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

  const [workout, setWorkout] = useState<WorkoutState | null>(null);

  const initialState = useMemo(() => (data ? buildInitialWorkoutState(data) : null), [data]);
  useEffect(() => {
    if (initialState) setWorkout(initialState);
  }, [initialState]);

  const elapsed = useStopwatch(Boolean(workout));

  const { doneSets, totalVolume, totalSets } = useMemo(() => {
    const exs = workout?.exercises ?? [];
    let done = 0,
      volume = 0,
      setsCount = 0;
    for (const ex of exs) {
      setsCount += ex.sets.length;
      for (const s of ex.sets) {
        if (s.done) {
          done += 1;
          const kg = parseFloat(s.kg || "0");
          const reps = parseInt(s.reps || "0", 10);
          if (!Number.isNaN(kg) && !Number.isNaN(reps)) volume += kg * reps;
        }
      }
    }
    return { doneSets: done, totalVolume: volume, totalSets: setsCount };
  }, [workout?.exercises]);

  // Reordenar ejercicios (DnD)
  const handleReorder = useCallback((items: WorkoutExercise[]) => {
    setWorkout((w) => (w ? { ...w, exercises: items } : w));
  }, []);

  // Handlers de sets/ejercicios
  const toggleSetDone = useCallback((ei: number, si: number) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;
        const sets = ex.sets.map((s, j) =>
          j === si ? { ...s, done: !s.done, doneAt: !s.done ? new Date().toISOString() : s.doneAt } : s
        );
        return { ...ex, sets };
      });
      return { ...w, exercises };
    });
  }, []);

  const updateSetField = useCallback((ei: number, si: number, field: "kg" | "reps" | "rpe", value: string) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;
        const sets = ex.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s));
        return { ...ex, sets };
      });
      return { ...w, exercises };
    });
  }, []);

  const addSet = useCallback((ei: number) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;
        const last = ex.sets[ex.sets.length - 1];
        const nextIdx = (ex.sets[ex.sets.length - 1]?.idx ?? ex.sets.length) + 1;
        return {
          ...ex,
          sets: [...ex.sets, { idx: nextIdx, kg: last?.kg ?? "", reps: last?.reps ?? "", rpe: "", done: false }],
        };
      });
      return { ...w, exercises };
    });
  }, []);

  const removeSet = useCallback((ei: number, si: number) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;
        const remaining = ex.sets.filter((_, j) => j !== si);
        const reindexed = remaining.map((s, idx) => ({ ...s, idx: idx + 1 }));
        return { ...ex, sets: reindexed };
      });
      return { ...w, exercises };
    });
  }, []);

  // borrar ejercicio
  const [deleteDlg, setDeleteDlg] = useState<{ open: boolean; idx: number; name: string }>({
    open: false,
    idx: -1,
    name: "",
  });
  const askDeleteExercise = useCallback(
    (ei: number, name?: string) => setDeleteDlg({ open: true, idx: ei, name: name || "este ejercicio" }),
    []
  );
  const confirmDeleteExercise = useCallback(() => {
    const idx = deleteDlg.idx;
    setDeleteDlg({ open: false, idx: -1, name: "" });
    if (idx < 0) return;
    setWorkout((w) =>
      w ? { ...w, exercises: w.exercises.filter((_, i) => i !== idx).map((ex, i) => ({ ...ex, orden: i + 1 })) } : w
    );
    toast.success("Ejercicio eliminado");
  }, [deleteDlg.idx]);

  // navegar/salir
  const routinePath = useMemo(
    () => (Number.isFinite(id_rutina) && id_rutina > 0 ? `/dashboard/routines/${id_rutina}` : "/dashboard/routines"),
    [id_rutina]
  );
  const [exitOpen, setExitOpen] = useState(false);
  const handleExitNow = useCallback(() => {
    setExitOpen(false);
    setWorkout(null);
    navigate(routinePath, { replace: true });
  }, [navigate, routinePath]);

  // agregar ejercicio desde catálogo
  const [showFinder, setShowFinder] = useState(false);
  const existingIds = useMemo(() => (workout?.exercises ?? []).map((ex) => ex.id_ejercicio), [workout?.exercises]);
  const addExtraExerciseFromCatalog = useCallback((e: any) => {
    setWorkout((w) => {
      if (!w) return w;
      const id_ejercicio = Number(e.id);
      if (w.exercises.some((ex) => ex.id_ejercicio === id_ejercicio)) return w; // doble seguridad
      const nextOrden = Math.max(0, ...w.exercises.map((ex) => ex.orden ?? 0)) + 1;
      const newEx: WorkoutExercise = {
        id_ejercicio,
        nombre: e.nombre ?? `Ejercicio ${e.id}`,
        imagen: e.ejemplo ?? null,
        orden: nextOrden,
        sets: [{ idx: 1, kg: "", reps: "", rpe: "", done: false }],
      };
      return { ...w, exercises: [...w.exercises, newEx] };
    });
    toast.success("Ejercicio agregado al final");
  }, []);

  // Guardado
  const [createError, setCreateError] = useState<string | null>(null);
  const buildPayloadFromState = useCallback(() => {
    if (!workout) return null;
    const setsValidos = workout.exercises.flatMap(
      (ex) =>
        ex.sets
          .map((s) => {
            const kg = parseFloat(s.kg);
            const reps = parseInt(s.reps, 10);
            if (Number.isNaN(kg) || Number.isNaN(reps)) return null;
            return {
              id_ejercicio: ex.id_ejercicio,
              idx: s.idx,
              kg,
              reps,
              rpe: s.rpe || null,
              done: !!s.done,
              done_at: s.done ? s.doneAt ?? new Date().toISOString() : null,
            };
          })
          .filter(Boolean) as any[]
    );
    const total_volumen = setsValidos.filter((s) => s.done).reduce((acc, s) => acc + s.kg * s.reps, 0);
    const duracion_seg = Math.max(1, Math.round(/* elapsed ms */ (0 + 0) / 1000)); // el server también puede cronometrar
    return {
      id_rutina: workout.id_rutina,
      started_at: workout.startedAt,
      ended_at: new Date().toISOString(),
      duracion_seg,
      total_volumen,
      sensacion_global: null,
      notas: null,
      sets: setsValidos,
    };
  }, [workout]);

  const handleFinalizar = useCallback(async () => {
    const payload = buildPayloadFromState();
    if (!payload) return;
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
  }, [buildPayloadFromState, createWorkout, navigate]);

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
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
      />

      {!isLoading && workout && (
        <WorkoutExerciseList
          exercises={workout.exercises}
          onReorder={(items) => handleReorder(items)}
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

      <div className="flex justify-end">
        {!showFinder ? (
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            onClick={() => setShowFinder(true)}
          >
            <span className="inline-flex items-center">
              <span className="i-lucide-plus mr-2" />
              Agregar ejercicios extra
            </span>
          </button>
        ) : null}
      </div>

      <ExerciseFinder
        existingIds={existingIds}
        open={showFinder}
        onClose={() => setShowFinder(false)}
        onAdd={addExtraExerciseFromCatalog}
      />

      <div className="flex justify-end gap-2">
        <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setExitOpen(true)}>
          Cancelar
        </button>
        <button
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
          disabled={saving}
          onClick={handleFinalizar}
        >
          {saving ? "Guardando..." : "Finalizar rutina"}
        </button>
      </div>

      <ExitConfirmationDialog open={exitOpen} onOpenChange={setExitOpen} onConfirm={handleExitNow} />
      <DeleteExerciseDialog
        open={deleteDlg.open}
        onOpenChange={(open) => setDeleteDlg((d) => ({ ...d, open }))}
        onConfirm={confirmDeleteExercise}
        exerciseName={deleteDlg.name}
      />
      {createError && <p className="text-xs text-destructive">{createError}</p>}
    </div>
  );
}
