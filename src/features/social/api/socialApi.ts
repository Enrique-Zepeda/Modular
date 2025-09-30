import { supabase } from "@/lib/supabase/client";
import type { SocialLike, SocialComment } from "@/types/social";

/** =========================
 *  Auth helpers
 * ========================= */
export async function getCurrentUserUid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** =========================
 *  Likes
 * ========================= */

/**
 * Devuelve un mapa sesión -> conteo de likes.
 */
export async function fetchLikesCountBySessions(sessionIds: number[]): Promise<Record<number, number>> {
  if (!sessionIds.length) return {};
  const { data, error } = await supabase.from("SocialLikes").select("id_sesion, id_like").in("id_sesion", sessionIds);

  if (error) throw error;
  const m = new Map<number, number>();
  for (const r of (data ?? []) as Pick<SocialLike, "id_sesion" | "id_like">[]) {
    m.set(r.id_sesion, (m.get(r.id_sesion) ?? 0) + 1);
  }
  return Object.fromEntries(m);
}

/**
 * ¿Yo di like a ESTA sesión?
 * (Compat con `useLikes` que espera un booleano)
 */
export async function fetchLikedByMe(sessionId: number): Promise<boolean> {
  const uid = await getCurrentUserUid();
  if (!uid) return false;
  const { data, error } = await supabase
    .from("SocialLikes")
    .select("id_like", { head: false, count: "exact" })
    .eq("author_uid", uid)
    .eq("id_sesion", sessionId)
    .limit(1);

  if (error) throw error;
  return Boolean((data ?? []).length);
}

/**
 * Versión batch (por si la usas en otro lado)
 * Devuelve mapa sesión -> likedByMe
 */
export async function fetchLikedByMeBatch(sessionIds: number[]): Promise<Record<number, boolean>> {
  const uid = await getCurrentUserUid();
  if (!uid || !sessionIds.length) return {};
  const { data, error } = await supabase
    .from("SocialLikes")
    .select("id_sesion")
    .eq("author_uid", uid)
    .in("id_sesion", sessionIds);

  if (error) throw error;
  const set = new Set((data ?? []).map((r: any) => r.id_sesion as number));
  const out: Record<number, boolean> = {};
  for (const id of sessionIds) out[id] = set.has(id);
  return out;
}

export async function addLike(sessionId: number): Promise<void> {
  const { error } = await supabase.from("SocialLikes").insert({ id_sesion: sessionId });
  // índice único hace idempotente el insert
  if (error && (error as any).code !== "23505") throw error;
}

export async function removeLike(sessionId: number): Promise<void> {
  const uid = await getCurrentUserUid();
  if (!uid) throw new Error("Usuario no autenticado");
  const { error } = await supabase.from("SocialLikes").delete().eq("id_sesion", sessionId).eq("author_uid", uid);
  if (error) throw error;
}

/** =========================
 *  Comments
 * ========================= */

/**
 * Paginación descendente por `created_at`.
 * Devuelve `nextCursor` para pedir la página siguiente (más antigua).
 */
export async function fetchComments(params: {
  sessionId: number;
  limit?: number;
  cursor?: string | null;
}): Promise<{ items: SocialComment[]; nextCursor: string | null }> {
  const { sessionId, limit = 20, cursor = null } = params;

  let q = supabase
    .from("SocialComments")
    .select("*")
    .eq("id_sesion", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) q = q.lt("created_at", cursor);

  const { data, error } = await q;
  if (error) throw error;

  const items = (data ?? []) as SocialComment[];
  const nextCursor = items.length === limit ? items[items.length - 1].created_at : null;
  return { items, nextCursor };
}

export async function createComment(sessionId: number, texto: string): Promise<SocialComment> {
  const { data, error } = await supabase
    .from("SocialComments")
    .insert({ id_sesion: sessionId, texto })
    .select("*")
    .single();
  if (error) throw error;
  return data as SocialComment;
}

export async function deleteComment(id_comment: number): Promise<void> {
  const { error } = await supabase.from("SocialComments").delete().eq("id_comment", id_comment);
  if (error) throw error;
}

/** Contador exacto de comentarios */
export async function fetchCommentsCount(sessionId: number): Promise<number> {
  const { count, error } = await supabase
    .from("SocialComments")
    .select("id_comment", { count: "exact", head: true })
    .eq("id_sesion", sessionId);
  if (error) throw error;
  return count ?? 0;
}

/** =========================
 *  Perfiles mínimos por UID
 * ========================= */
export type MinimalProfile = { auth_uid: string; username: string | null; url_avatar: string | null };

export async function fetchProfilesByUids(uids: string[]): Promise<Record<string, MinimalProfile>> {
  const uniq = Array.from(new Set(uids.filter(Boolean)));
  if (!uniq.length) return {};
  const { data, error } = await supabase.from("Usuarios").select("auth_uid, username, url_avatar").in("auth_uid", uniq);
  if (error) throw error;
  const out: Record<string, MinimalProfile> = {};
  for (const row of (data ?? []) as MinimalProfile[]) out[row.auth_uid] = row;
  return out;
}
