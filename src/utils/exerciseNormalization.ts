export interface NormalizedExercise {
  nombre: string;
  imagen: string | null;
  grupo_muscular: string | null;
  equipamiento?: string | null;
  dificultad?: string | null; // Etiqueta capitalizada
  dificultadKey?: "principiante" | "intermedio" | "avanzado" | null; // Para filtrar
  descripcion?: string;
}

/**
 * Normaliza un ejercicio cualquiera (venga plano o dentro de Ejercicios).
 * Cubre alias comunes: ejemplo, gif_url, imagen_url, imagen, image, thumbnail, etc.
 */
export function normalizeExerciseData(exercise: any): NormalizedExercise {
  // Si viene de la rutina, los datos reales están en Ejercicios
  const source = exercise?.Ejercicios ?? exercise ?? {};

  // Nombre
  const nombre = source.nombre ?? source.name ?? source.title ?? "Ejercicio sin nombre";

  // Imagen (incluye 'ejemplo', que es el que usa la UI del builder)
  const rawImg =
    source.ejemplo ??
    source.gif_url ??
    source.imagen_url ??
    source.imagen ??
    source.image ??
    source.img ??
    source.gifUrl ??
    source.imageUrl ??
    source.thumbnail ??
    null;

  const imagen = rawImg ? String(rawImg) : null;

  // Grupo muscular
  const grupo_muscular = source.grupo_muscular ?? source.muscle_group ?? source.muscleGroup ?? null;

  // Equipamiento (acepta legado 'equipamento')
  const equipRaw = source.equipamiento ?? source.equipamento ?? source.equipment ?? null;
  const equipamiento = equipRaw ? String(equipRaw) : null;

  // Dificultad para filtros y etiqueta capitalizada para la UI
  const diffRaw = (source.dificultad ?? source.difficulty ?? "").toString().trim().toLowerCase();
  const dificultadKey =
    diffRaw === "principiante" || diffRaw === "intermedio" || diffRaw === "avanzado" ? (diffRaw as any) : null;

  const dificultad =
    dificultadKey === "principiante"
      ? "Principiante"
      : dificultadKey === "intermedio"
      ? "Intermedio"
      : dificultadKey === "avanzado"
      ? "Avanzado"
      : null;

  const descripcion = source.descripcion ?? source.description ?? "";

  return { nombre, imagen, grupo_muscular, equipamiento, dificultad, dificultadKey, descripcion };
}
