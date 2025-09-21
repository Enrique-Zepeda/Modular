import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import type { WorkoutExercise, WorkoutState } from "@/features/workouts/types";

type DeleteDlgState = { open: boolean; idx: number; name: string };

export function useWorkoutEditor() {
  const [workout, setWorkout] = useState<WorkoutState | null>(null);
  const [deleteDlg, setDeleteDlg] = useState<DeleteDlgState>({ open: false, idx: -1, name: "" });

  // Seed desde initialState (sólo si no hay estado cargado)
  const setFromInitial = useCallback(
    (initial: WorkoutState | null) => {
      if (initial && !workout) setWorkout(initial);
    },
    [workout]
  );

  const existingIds = useMemo(() => (workout?.exercises ?? []).map((ex) => ex.id_ejercicio), [workout?.exercises]);

  const handleReorder = useCallback((items: WorkoutExercise[]) => {
    setWorkout((w) => (w ? { ...w, exercises: items.map((ex, i) => ({ ...ex, orden: i + 1 })) } : w));
  }, []);

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

  const askDeleteExercise = useCallback((ei: number, name?: string) => {
    setDeleteDlg({ open: true, idx: ei, name: name || "este ejercicio" });
  }, []);

  const confirmDeleteExercise = useCallback(() => {
    const idx = deleteDlg.idx;
    setDeleteDlg({ open: false, idx: -1, name: "" });
    if (idx < 0) return;
    setWorkout((w) =>
      w ? { ...w, exercises: w.exercises.filter((_, i) => i !== idx).map((ex, i) => ({ ...ex, orden: i + 1 })) } : w
    );
    toast.success("Ejercicio eliminado");
  }, [deleteDlg.idx]);

  // Agregar ejercicio desde catálogo (simple)
  const addExtraExerciseFromCatalog = useCallback((e: any) => {
    setWorkout((w) => {
      if (!w) return w;
      const id_ejercicio = Number(e.id);
      if (w.exercises.some((ex) => ex.id_ejercicio === id_ejercicio)) {
        toast.error("Ese ejercicio ya está en la lista");
        return w;
      }
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

  // Agregar ejercicio con configuración rápida (series/reps/kg)
  const addExtraExerciseConfigured = useCallback((e: any, cfg: { series: number; reps: number; kg: number }) => {
    setWorkout((w) => {
      if (!w) return w;
      const id_ejercicio = Number(e.id);
      if (w.exercises.some((ex) => ex.id_ejercicio === id_ejercicio)) {
        toast.error("Ese ejercicio ya está en la lista");
        return w;
      }
      const nextOrden = Math.max(0, ...w.exercises.map((ex) => ex.orden ?? 0)) + 1;

      const sets = Array.from({ length: Math.max(1, cfg.series) }, (_, i) => ({
        idx: i + 1,
        kg: String(cfg.kg ?? 0),
        reps: String(cfg.reps ?? 0),
        rpe: "",
        done: false,
      }));

      const newEx: WorkoutExercise = {
        id_ejercicio,
        nombre: e.nombre ?? `Ejercicio ${e.id}`,
        imagen: e.ejemplo ?? null,
        orden: nextOrden,
        sets,
      };

      return { ...w, exercises: [...w.exercises, newEx] };
    });
    toast.success("Ejercicio agregado");
  }, []);

  return {
    workout,
    setFromInitial,
    setWorkout,
    existingIds,
    deleteDlg,
    setDeleteDlg,

    // acciones
    handleReorder,
    toggleSetDone,
    updateSetField,
    addSet,
    removeSet,
    askDeleteExercise,
    confirmDeleteExercise,

    addExtraExerciseFromCatalog,
    addExtraExerciseConfigured,
  };
}
