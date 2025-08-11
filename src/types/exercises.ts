export interface Exercise {
  id: number;
  nombre: string | null;
  grupo_muscular: string | null;
  descripcion: string | null;
  equipamento: string | null; // Note: without 'n' to match your schema
  dificultad: string | null;
  musculos_involucrados: string | null;
  ejemplo: string | null;
}

export interface ExerciseFilters {
  grupo_muscular?: string[];
  dificultad?: "principiante" | "intermedio" | "avanzado";
  equipamento?: string; // Add equipment filter
  search?: string;
}

export interface ExerciseListResponse {
  data: Exercise[];
  error: unknown;
  count?: number;
}

export interface ExerciseQueryParams {
  grupo_muscular?: string[];
  dificultad?: "principiante" | "intermedio" | "avanzado";
  equipamento?: string; // Add equipment filter
  search?: string;
  from?: number;
  to?: number;
}
