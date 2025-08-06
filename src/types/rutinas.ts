export interface Rutina {
  id_rutina: number;
  nombre: string;
  descripcion: string | null;
  nivel_recomendado: 'principiante' | 'intermedio' | 'avanzado' | null;
  objetivo: 'fuerza' | 'hipertrofia' | 'resistencia' | null;
  duracion_estimada: number | null;
}

export interface Ejercicio {
  id: number;
  nombre: string | null;
  grupo_muscular: string | null;
  descripcion: string | null;
  equipamento: string | null;
  dificultad: string | null;
  musculos_involucrados: string | null;
  ejemplo: string | null;
}

export interface EjercicioRutina {
  id_rutina: number;
  id_ejercicio: number;
  series: number | null;
  repeticiones: number | null;
  peso_sugerido: number | null;
}

export interface RutinaConEjercicios extends Rutina {
  ejercicios: (EjercicioRutina & { ejercicio: Ejercicio })[];
}

export interface CrearRutinaFormData {
  nombre: string;
  descripcion: string;
  nivel_recomendado: 'principiante' | 'intermedio' | 'avanzado';
  objetivo: 'fuerza' | 'hipertrofia' | 'resistencia';
  duracion_estimada: number;
}

export interface AgregarEjercicioFormData {
  id_ejercicio: number;
  series: number;
  repeticiones: number;
  peso_sugerido: number;
}

export interface FiltrosEjercicios {
  grupo_muscular?: string;
  dificultad?: string;
  equipamento?: string;
  search?: string;
} 