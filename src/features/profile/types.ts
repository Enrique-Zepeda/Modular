export type ProfileSummary = {
  id_usuario: number;
  username: string | null;
  nombre: string | null;
  url_avatar: string | null;
  workouts_count: number;
  total_duration_sec: number;
  total_volume_kg: number;
  last_workout_id: number | null;
  last_ended_at: string | null;
  friends_count: number;
};

export type PublicLastWorkout = {
  id_sesion: number;
  ended_at: string; // ISO
  duracion_seg: number;
  sets_count: number;
  total_volume_kg: number;
  difficulty_label: string | null;
};

export type PublicLastWorkoutExercise = {
  id_ejercicio: number;
  nombre: string;
  imagen_url: string | null;
  sets_count: number;
  volume_kg: number;
};
