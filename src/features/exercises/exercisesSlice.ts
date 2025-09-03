// Archivo temporal para mantener compatibilidad
// Los hooks reales están en rutinasApi.ts

export const useGetMuscleGroupsQuery = () => ({
  data: { data: ["Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Core"], error: null },
  isLoading: false,
});

export const useGetEquipmentTypesQuery = () => ({
  data: { data: ["Peso libre", "Máquina", "Cuerda", "Sin equipamiento"], error: null },
  isLoading: false,
});

export const useGetDifficultyLevelsQuery = () => ({
  data: { data: ["principiante", "intermedio", "avanzado"], error: null },
  isLoading: false,
});

export const useGetExercisesQuery = () => ({
  data: { data: [], error: null, count: 0 },
  isLoading: false,
  isFetching: false,
  error: null,
});

export const exercisesApi = {
  reducerPath: "exercisesApi",
  reducer: () => ({}),
  middleware: () => () => () => {},
};
