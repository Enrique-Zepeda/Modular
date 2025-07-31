export const TIPOS_RUTINA = {
  FUERZA: 'fuerza',
  HIPERTROFIA: 'hipertrofia',
  RESISTENCIA: 'resistencia'
} as const;

export const NIVELES_DIFICULTAD = {
  PRINCIPIANTE: 'principiante',
  INTERMEDIO: 'intermedio',
  AVANZADO: 'avanzado'
} as const;

export const TIPOS_RUTINA_LABELS = {
  [TIPOS_RUTINA.FUERZA]: 'Fuerza',
  [TIPOS_RUTINA.HIPERTROFIA]: 'Hipertrofia',
  [TIPOS_RUTINA.RESISTENCIA]: 'Resistencia'
} as const;

export const NIVELES_DIFICULTAD_LABELS = {
  [NIVELES_DIFICULTAD.PRINCIPIANTE]: 'Principiante',
  [NIVELES_DIFICULTAD.INTERMEDIO]: 'Intermedio',
  [NIVELES_DIFICULTAD.AVANZADO]: 'Avanzado'
} as const;

export const DIAS_POR_SEMANA_OPTIONS = [
  { value: 1, label: '1 día' },
  { value: 2, label: '2 días' },
  { value: 3, label: '3 días' },
  { value: 4, label: '4 días' },
  { value: 5, label: '5 días' },
  { value: 6, label: '6 días' },
  { value: 7, label: '7 días' }
] as const; 