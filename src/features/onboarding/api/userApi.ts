import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/user";

export async function getSessionAuthUid(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const uid = data.session?.user?.id ?? null;

  return uid;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const authUid = await getSessionAuthUid();
  if (!authUid) return null;

  const { data, error } = await supabase
    .from<UserProfile>("Usuarios")
    .select("*")
    .eq("auth_uid", authUid)
    .maybeSingle();

  if (error) throw error;

  return data ?? null;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username) return false;
  const { data, error } = await supabase.rpc("username_is_available", { p_username: username });
  if (!error && typeof data === "boolean") return data;

  const { data: rows, error: selErr } = await supabase
    .from("Usuarios")
    .select("id_usuario")
    .ilike("username", username);
  if (selErr) throw selErr;
  return (rows?.length ?? 0) === 0;
}

export async function upsertCurrentUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const username = payload.username?.trim() ?? null;
  const nombre = payload.nombre?.trim() ?? null;

  const { data, error } = await supabase.rpc("save_current_user_profile", {
    p_username: username,
    p_nombre: nombre,
    p_edad: payload.edad ?? null,
    p_peso: payload.peso ?? null,
    p_altura: payload.altura ?? null,
    p_nivel: payload.nivel_experiencia ?? null,
    p_objetivo: payload.objetivo ?? null,
    p_sexo: payload.sexo ?? null,
  });

  if (error) {
    console.error("[ONBOARD][api] save_current_user_profile RPC error", error);
    throw error;
  }

  return data as unknown as UserProfile;
}
