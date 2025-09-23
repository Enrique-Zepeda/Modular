import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _recoveryClient: SupabaseClient | null = null;

/**
 * Cliente SOLO para /auth/reset-password:
 *  - no persiste sesión (no localStorage)
 *  - sin auto refresh
 *  - no detecta sesión en la URL
 *  - sin multi-tab (no propaga eventos a otras pestañas)
 * Cacheado a nivel módulo para que sea estable entre renders.
 */
export function getRecoverySupabase(): SupabaseClient {
  if (_recoveryClient) return _recoveryClient;

  const url = import.meta.env.VITE_SUPABASE_URL!;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;

  _recoveryClient = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      multiTab: false,
    },
  });

  return _recoveryClient;
}
