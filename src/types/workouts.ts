export interface FinishedWorkoutExercise {
  id: number | string | null;
  nombre: string | null;
  grupo_muscular: string | null;
  equipamento: string | null;
  ejemplo?: string | null; // 🔹 URL imagen
  sets_done: number | null;
  volume?: number | string | null;
}

export interface FinishedWorkoutRich {
  id_sesion: number;
  id_rutina: number | null;
  owner_uid: string;
  started_at: string;
  ended_at: string;
  total_sets: number;
  total_volume: number | string;
  titulo: string;
  username: string | null;
  url_avatar: string | null;
  ejercicios?: FinishedWorkoutExercise[];
  sensacion_final?: string | null;
}

export const parseVolume = (v: number | string | null | undefined) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
