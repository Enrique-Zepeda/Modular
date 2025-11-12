import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PrevSet = { kg: number | null; reps: number | null; rpe: string | null };
export type PreviousSetsMap = Record<number, Record<number, PrevSet>>;

export interface WorkoutSet {
  id: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  previous?: { weight: number; reps: number };
}

export interface WorkoutExercise {
  id: string;
  exerciseId: number;
  exerciseName: string;
  exerciseIcon?: string;
  sets: WorkoutSet[];
  notes: string;
  restTimer: number; // 0 = off, 30, 60, 90 seconds
}

export interface WorkoutSession {
  id: string;
  routineId: number;
  routineName: string;
  startTime: Date;
  duration: number; // in seconds
  exercises: WorkoutExercise[];
  totalVolume: number;
  totalSets: number;
}

interface WorkoutLogState {
  currentSession: WorkoutSession | null;
  isLogging: boolean;
  previousSetsByExercise: PreviousSetsMap; // cache opcional
}

/* =======================
   Persistencia local (NEW)
   ======================= */
export const LIVE_STORAGE_KEY = "workout_live_v1";

/** Guarda solo lo necesario para reanudar el entrenamiento en vivo */
export function saveLiveWorkoutToStorage(state: Pick<WorkoutLogState, "currentSession" | "isLogging">) {
  try {
    const payload = state.currentSession
      ? {
          isLogging: state.isLogging,
          // serializa startTime a string ISO
          currentSession: {
            ...state.currentSession,
            startTime:
              (state.currentSession.startTime as any)?.toISOString?.() ?? String(state.currentSession.startTime),
          },
        }
      : { isLogging: false, currentSession: null };
    localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // noop
  }
}

/** Lee una sesión guardada (si existe) y rehidrata tipos básicos */
export function loadLiveWorkoutFromStorage(): { isLogging: boolean; currentSession: WorkoutSession | null } | null {
  try {
    const raw = localStorage.getItem(LIVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.currentSession?.startTime) {
      parsed.currentSession.startTime = new Date(parsed.currentSession.startTime);
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearLiveWorkoutStorage() {
  try {
    localStorage.removeItem(LIVE_STORAGE_KEY);
  } catch {
    // noop
  }
}

/** Estado inicial ahora rehidrata desde localStorage si había una sesión viva */
function getInitialState(): WorkoutLogState {
  const persisted = loadLiveWorkoutFromStorage();
  if (persisted?.isLogging && persisted.currentSession) {
    return {
      currentSession: persisted.currentSession,
      isLogging: true,
      previousSetsByExercise: {},
    };
  }
  return {
    currentSession: null,
    isLogging: false,
    previousSetsByExercise: {},
  };
}

const initialState: WorkoutLogState = getInitialState();

const workoutLogSlice = createSlice({
  name: "workoutLog",
  initialState,
  reducers: {
    // Restaura explícitamente (por si quieres llamarlo desde UI)
    restoreWorkoutSession: (state, action: PayloadAction<WorkoutSession>) => {
      state.currentSession = action.payload;
      state.isLogging = true;
    },

    // Cache opcional de previous sets
    setPreviousSetsBatch: (state, action: PayloadAction<PreviousSetsMap>) => {
      const incoming = action.payload || {};
      for (const [exIdStr, setsByIdx] of Object.entries(incoming)) {
        const exId = Number(exIdStr);
        if (!state.previousSetsByExercise[exId]) state.previousSetsByExercise[exId] = {} as any;
        Object.assign(state.previousSetsByExercise[exId], setsByIdx);
      }
    },

    // --- resto de reducers existentes ---
    startWorkoutSession: (
      state,
      action: PayloadAction<{ routineId: number; routineName: string; exercises: any[] }>
    ) => {
      const { routineId, routineName, exercises } = action.payload;

      state.currentSession = {
        id: `workout_${Date.now()}`,
        routineId,
        routineName,
        startTime: new Date(),
        duration: 0,
        exercises: exercises.map((ex, index) => ({
          id: `exercise_${index}`,
          exerciseId: ex.id_ejercicio || ex.id,
          exerciseName: ex.ejercicio?.nombre || ex.nombre || "Exercise",
          sets: ex.series
            ? Array.from({ length: ex.series }, (_, i) => ({
                id: `set_${index}_${i}`,
                weight: ex.peso_sugerido || null,
                reps: ex.repeticiones || null,
                rpe: null,
                completed: false,
              }))
            : [
                {
                  id: `set_${index}_0`,
                  weight: null,
                  reps: null,
                  rpe: null,
                  completed: false,
                },
              ],
          notes: "",
          restTimer: 0,
        })),
        totalVolume: 0,
        totalSets: 0,
      };
      state.isLogging = true;
    },

    updateSetValue: (
      state,
      action: PayloadAction<{
        exerciseId: string;
        setId: string;
        field: "weight" | "reps" | "rpe";
        value: number | null;
      }>
    ) => {
      if (!state.currentSession) return;

      const { exerciseId, setId, field, value } = action.payload;
      const exercise = state.currentSession.exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const set = exercise.sets.find((s) => s.id === setId);
      if (!set) return;

      set[field] = value;

      state.currentSession.totalVolume = state.currentSession.exercises.reduce((total, ex) => {
        return (
          total +
          ex.sets.reduce((exTotal, set) => {
            return exTotal + (set.weight || 0) * (set.reps || 0);
          }, 0)
        );
      }, 0);
    },

    toggleSetCompleted: (state, action: PayloadAction<{ exerciseId: string; setId: string }>) => {
      if (!state.currentSession) return;

      const { exerciseId, setId } = action.payload;
      const exercise = state.currentSession.exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const set = exercise.sets.find((s) => s.id === setId);
      if (!set) return;

      set.completed = !set.completed;

      state.currentSession.totalSets = state.currentSession.exercises.reduce((total, ex) => {
        return total + ex.sets.filter((s) => s.completed).length;
      }, 0);
    },

    addSet: (state, action: PayloadAction<{ exerciseId: string }>) => {
      if (!state.currentSession) return;

      const { exerciseId } = action.payload;
      const exercise = state.currentSession.exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const newSetIndex = exercise.sets.length;
      exercise.sets.push({
        id: `set_${exerciseId}_${newSetIndex}_${Date.now()}`,
        weight: null,
        reps: null,
        rpe: null,
        completed: false,
      });
    },

    duplicateSet: (state, action: PayloadAction<{ exerciseId: string; setId: string }>) => {
      if (!state.currentSession) return;

      const { exerciseId, setId } = action.payload;
      const exercise = state.currentSession.exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const setToDuplicate = exercise.sets.find((s) => s.id === setId);
      if (!setToDuplicate) return;

      const newSet: WorkoutSet = {
        id: `set_${exerciseId}_${Date.now()}`,
        weight: setToDuplicate.weight,
        reps: setToDuplicate.reps,
        rpe: setToDuplicate.rpe,
        completed: false,
        previous: setToDuplicate.previous,
      };

      exercise.sets.push(newSet);
    },

    removeSet: (state, action: PayloadAction<{ exerciseId: string; setId: string }>) => {
      if (!state.currentSession) return;

      const { exerciseId, setId } = action.payload;
      const exercise = state.currentSession.exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      exercise.sets = exercise.sets.filter((s) => s.id !== setId);
    },

    updateExerciseNotes: (state, action: PayloadAction<{ exerciseId: string; notes: string }>) => {
      if (!state.currentSession) return;

      const { exerciseId, notes } = action.payload;
      const exercise = state.currentSession.exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      exercise.notes = notes;
    },

    updateRestTimer: (state, action: PayloadAction<{ exerciseId: string; timer: number }>) => {
      if (!state.currentSession) return;

      const { exerciseId, timer } = action.payload;
      const exercise = state.currentSession.exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      exercise.restTimer = timer;
    },

    addExerciseToSession: (state, action: PayloadAction<{ exercise: any }>) => {
      if (!state.currentSession) return;

      const { exercise } = action.payload;
      const newExercise: WorkoutExercise = {
        id: `exercise_${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.nombre || "New Exercise",
        sets: [
          {
            id: `set_${Date.now()}_0`,
            weight: null,
            reps: null,
            rpe: null,
            completed: false,
          },
        ],
        notes: "",
        restTimer: 0,
      };

      state.currentSession.exercises.push(newExercise);
    },

    updateSessionDuration: (state, action: PayloadAction<number>) => {
      if (!state.currentSession) return;
      state.currentSession.duration = action.payload;
    },

    finishWorkoutSession: (state) => {
      state.currentSession = null;
      state.isLogging = false;
    },
  },
});

export const {
  restoreWorkoutSession,
  setPreviousSetsBatch,
  startWorkoutSession,
  updateSetValue,
  toggleSetCompleted,
  addSet,
  duplicateSet,
  removeSet,
  updateExerciseNotes,
  updateRestTimer,
  addExerciseToSession,
  updateSessionDuration,
  finishWorkoutSession,
} = workoutLogSlice.actions;

export default workoutLogSlice.reducer;
