export interface NormalizedExercise {
  nombre: string;
  imagen: string | null;
  grupo_muscular: string | null;
}

/**
 * Normalizes exercise data from different sources (library, API, etc.)
 * Handles common field name variations for exercise properties
 */
export function normalizeExerciseData(exercise: any): NormalizedExercise {
  // Handle nested Ejercicios object (from routine exercises)
  const source = exercise?.Ejercicios || exercise;

  // Normalize name - try multiple possible field names
  const nombre = source?.nombre || source?.name || source?.title || "Ejercicio sin nombre";

  // Normalize image - try multiple possible field names
  const imagen =
    source?.ejemplo ||
    source?.image ||
    source?.img_url ||
    source?.thumbnail ||
    source?.gifUrl ||
    source?.imageUrl ||
    null;

  // Normalize muscle group
  const grupo_muscular = source?.grupo_muscular || source?.muscle_group || source?.muscleGroup || null;

  return {
    nombre,
    imagen,
    grupo_muscular,
  };
}
