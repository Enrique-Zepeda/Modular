export interface IRutina {
  id_rutina: number;
  nombre: string;
  descripcion: string;
  nivel_recomendado: 'principiante' | 'intermedio' | 'avanzado';
  objetivo: 'fuerza' | 'hipertrofia' | 'resistencia';
  duracion_estimada: number;
  created_at?: string;
  updated_at?: string;
}

export interface IRutinaInput {
  nombre: string;
  descripcion: string;
  nivel_recomendado: 'principiante' | 'intermedio' | 'avanzado';
  objetivo: 'fuerza' | 'hipertrofia' | 'resistencia';
  duracion_estimada: number;
}

export interface ICrearRutinaForm {
  nombre: string;
  descripcion: string;
  tipoRutina: 'fuerza' | 'hipertrofia' | 'resistencia';
  diasPorSemana: number;
  nivelDificultad: 'principiante' | 'intermedio' | 'avanzado';
} 