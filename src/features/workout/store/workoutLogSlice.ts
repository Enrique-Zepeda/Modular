import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WorkoutSet {
  id: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  previous?: {
    weight: number;
    reps: number;
  };
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
}

const initialState: WorkoutLogState = {
  currentSession: null,
  isLogging: false,
};

const workoutLogSlice = createSlice({
  name: "workoutLog",
  initialState,
  reducers: {
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
                previous:
                  Math.random() > 0.5
                    ? {
                        weight: (ex.peso_sugerido || 50) - 5,
                        reps: (ex.repeticiones || 10) + Math.floor(Math.random() * 3),
                      }
                    : undefined,
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

      // Recalculate totals
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

      // Recalculate total sets
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
