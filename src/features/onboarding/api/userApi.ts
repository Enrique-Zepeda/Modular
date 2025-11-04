import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/user";

/** Devuelve el auth.uid() de la sesión actual (o null). */
export async function getSessionAuthUid(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user?.id ?? null;
}

/** Perfil del usuario actual (o null si no hay sesión). */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const authUid = await getSessionAuthUid();
  if (!authUid) return null;

  const { data, error } = await supabase.from("Usuarios").select("*").eq("auth_uid", authUid).maybeSingle();

  if (error) throw error;
  return (data as unknown as UserProfile) ?? null;
}

/** Verifica disponibilidad de username. */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username) return false;

  const { data, error } = await supabase.rpc("username_is_available", { p_username: username });
  if (!error && typeof data === "boolean") return data;

  // Fallback por si faltara el RPC
  const { data: rows, error: selErr } = await supabase
    .from("Usuarios")
    .select("id_usuario")
    .ilike("username", username);

  if (selErr) throw selErr;
  return (rows?.length ?? 0) === 0;
}

/** Crea/actualiza el perfil actual mediante RPC. Mantiene compatibilidad con 'edad'. */
export async function upsertCurrentUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const username = (payload.username ?? "").trim();
  const nombre = (payload.nombre ?? "").trim();

  const { data, error } = await supabase.rpc("save_current_user_profile", {
    p_username: username || null,
    p_nombre: nombre || null,
    p_edad: payload.edad ?? null, // fallback de compatibilidad
    p_peso: payload.peso ?? null,
    p_altura: payload.altura ?? null,
    p_nivel: payload.nivel_experiencia ?? null,
    p_objetivo: payload.objetivo ?? null,
    p_sexo: payload.sexo ?? null,
    // ✅ Nuevo: DOB (si viene, el trigger recalcula edad)
    p_fecha_nacimiento: (payload as any).fecha_nacimiento ?? null,
  });

  if (error) {
    console.error("[ONBOARD][api] save_current_user_profile RPC error", error);
    throw error;
  }

  return data as unknown as UserProfile;
}
