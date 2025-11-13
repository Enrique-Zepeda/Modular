import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/* =========================
   Persistencia local (NEW)
   ========================= */
const SNAPSHOT_PREFIX = "workout_live_v1";
const START_PREFIX = "workout_live_start_v1";
const SNAPSHOT_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function snapKey(routineId: number) {
  return `${SNAPSHOT_PREFIX}:${routineId}`;
}
function startKey(routineId: number) {
  return `${START_PREFIX}:${routineId}`;
}
function loadSnapshot(routineId: number) {
  try {
    const raw = localStorage.getItem(snapKey(routineId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed?.savedAt ?? 0);
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > SNAPSHOT_TTL_MS) return null;
    return parsed?.workout ?? null;
  } catch {
    return null;
  }
}
function saveSnapshot(routineId: number, workout: any) {
  try {
    localStorage.setItem(snapKey(routineId), JSON.stringify({ savedAt: Date.now(), workout }));
  } catch {
    /* noop */
  }
}
function clearSnapshot(routineId: number) {
  try {
    localStorage.removeItem(snapKey(routineId));
  } catch {
    /* noop */
  }
}
function loadStartedAt(routineId: number): string | null {
  try {
    return localStorage.getItem(startKey(routineId));
  } catch {
    return null;
  }
}
function saveStartedAt(routineId: number, iso: string) {
  try {
    localStorage.setItem(startKey(routineId), iso);
  } catch {
    /* noop */
  }
}
function clearStartedAt(routineId: number) {
  try {
    localStorage.removeItem(startKey(routineId));
  } catch {
    /* noop */
  }
}

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

  /* --------------------------------------------------
     Rehidratación: si hay snapshot, úsalo como semilla
     -------------------------------------------------- */
  const [rehydrated, setRehydrated] = useState(false);
  useEffect(() => {
    if (!Number.isFinite(id_rutina) || id_rutina <= 0) return;
    if (rehydrated || workout) return;
    const snap = loadSnapshot(id_rutina);
    if (snap) {
      setFromInitial(snap);
      setRehydrated(true);
    } else {
      setRehydrated(true);
    }
  }, [id_rutina, rehydrated, workout, setFromInitial]);

  // Seed normal desde la rutina (solo si no hay workout aún)
  const initialState = useMemo(() => (data ? buildInitialWorkoutState(data) : null), [data]);
  useEffect(() => {
    if (!workout && initialState && rehydrated) setFromInitial(initialState);
  }, [initialState, workout, setFromInitial, rehydrated]);

  /* --------------------------------------------
     Cronómetro persistente basado en startedAt
     -------------------------------------------- */
  const [startedAt, setStartedAt] = useState<string | null>(() =>
    Number.isFinite(id_rutina) && id_rutina > 0 ? loadStartedAt(id_rutina) : null
  );

  useEffect(() => {
    if (!Number.isFinite(id_rutina) || id_rutina <= 0) return;
    if (!workout) return;
    // si no hay startedAt guardado, lo seteamos ahora
    if (!startedAt) {
      const iso = new Date().toISOString();
      saveStartedAt(id_rutina, iso);
      setStartedAt(iso);
    }
  }, [id_rutina, workout, startedAt]);

  const elapsed = useStopwatch(Boolean(workout), startedAt ?? undefined);
  const { doneSets, totalVolume, totalSets } = useWorkoutKpis(workout);

  /* ----------------------------------------------------
     Autosave (debounce) + guardado al ocultar/cerrar
     ---------------------------------------------------- */
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id_rutina) || id_rutina <= 0) return;
    if (!workout) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      saveSnapshot(id_rutina, workout);
    }, 900);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [id_rutina, workout]);

  useEffect(() => {
    if (!Number.isFinite(id_rutina) || id_rutina <= 0) return;
    const handler = () => {
      if (workout) saveSnapshot(id_rutina, workout);
    };
    document.addEventListener("visibilitychange", handler);
    window.addEventListener("pagehide", handler);
    window.addEventListener("beforeunload", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("pagehide", handler);
      window.removeEventListener("beforeunload", handler);
    };
  }, [id_rutina, workout]);

  /* -----------------------------
     navegación / salida
     ----------------------------- */
  const routinePath = useMemo(
    () => (Number.isFinite(id_rutina) && id_rutina > 0 ? `/dashboard/routines/${id_rutina}` : "/dashboard/routines"),
    [id_rutina]
  );
  const [exitOpen, setExitOpen] = useState(false);
  const handleExitNow = useCallback(() => {
    // limpiar snapshot de esta rutina
    if (Number.isFinite(id_rutina) && id_rutina > 0) {
      clearSnapshot(id_rutina);
      clearStartedAt(id_rutina);
    }
    setExitOpen(false);
    navigate(routinePath, { replace: true });
  }, [navigate, routinePath, id_rutina]);

  const [configDlg, setConfigDlg] = useState<{ open: boolean; exercise: any | null }>({
    open: false,
    exercise: null,
  });

  // Guardado final
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
      // limpiar snapshot tras guardar
      if (Number.isFinite(id_rutina) && id_rutina > 0) {
        clearSnapshot(id_rutina);
        clearStartedAt(id_rutina);
      }
      navigate("/dashboard");
    } catch (e: any) {
      setCreateError(e?.data?.message || e?.message || "Error desconocido");
      toast.error("No se pudo guardar el entrenamiento");
    }
  }, [workout, createWorkout, navigate, id_rutina]);

  return (
    <div className="mx-auto max-w-[min(100%,theme(spacing.7xl))] px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <WorkoutHeader
        title={workout?.nombre ?? (isLoading ? "Cargando..." : isError ? "Error" : "Entrenamiento")}
        description={workout?.descripcion}
        elapsed={elapsed}
      />

      {/* KPIs sticky-friendly (el propio componente maneja el sticky) */}
      <WorkoutKpisBar
        doneSets={doneSets}
        totalSets={totalSets}
        totalVolume={totalVolume}
        onExit={() => setExitOpen(true)}
        onFinish={handleFinalizar}
        saving={saving}
      />

      {/* Layout principal: 1 col en móvil; desde lg = 2+1 con sidebar sticky */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* Col izquierda: ejercicios (min-w-0 evita overflow horizontal) */}
        <div className="lg:col-span-2 min-w-0">
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

        {/* Col derecha: finder (sidebar sticky en desktop, bloque normal en móvil) */}
        <div className="lg:col-span-1 min-w-0 space-y-4 lg:sticky lg:top-[calc(env(safe-area-inset-top)+4.5rem)] lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
          <ExerciseFinder
            existingIds={existingIds}
            open={true}
            onAdd={(e) => setConfigDlg({ open: true, exercise: e })}
          />
        </div>
      </div>

      {/* Diálogos y errores */}
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
