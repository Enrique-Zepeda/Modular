import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/** Extrae la foto desde metadatos/identities del proveedor (Google) */
function extractProviderAvatarUrl(user: User): string | null {
  const md: any = user.user_metadata || {};
  const viaMetadata = md.avatar_url || md.picture || null;

  const viaIdentity = (user.identities || []).find((i: any) => i.provider === "google")?.identity_data as
    | any
    | undefined;

  const viaGoogle = viaIdentity?.picture || null;
  const url = viaMetadata || viaGoogle;
  return url ? String(url) : null;
}

let lastSyncedFor: string | null = null;

/**
 * Sincroniza la foto del proveedor a public."Usuarios".url_avatar
 * - Si hay fila del usuario → usa RPC update_current_user_avatar(p_url)
 * - Si NO hay fila aún → inserta una mínima (auth_uid, correo, url_avatar) sin bloquear el flujo
 */
export async function syncProviderAvatarIfNeeded(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (lastSyncedFor === user.id) return; // evita repeticiones en la misma sesión
    lastSyncedFor = user.id;

    const avatarUrl = extractProviderAvatarUrl(user);
    if (!avatarUrl) return;

    const { data: row, error: selErr } = await supabase
      .from("Usuarios")
      .select("id_usuario, url_avatar, correo")
      .eq("auth_uid", user.id)
      .maybeSingle();

    if (selErr) {
      console.warn("[sync avatar] select error (ignorado):", selErr);
      return;
    }

    if (!row) {
      // No existe aún el perfil → inserta mínimo; tu onboarding seguirá funcionando
      await supabase.from("Usuarios").insert({
        auth_uid: user.id,
        correo: user.email,
        url_avatar: avatarUrl,
      });
      return;
    }

    if (!row.url_avatar || row.url_avatar !== avatarUrl) {
      await supabase.rpc("update_current_user_avatar", { p_url: avatarUrl });
    }
  } catch (e) {
    console.warn("[sync avatar] error (ignorado):", e);
  }
}
