import { supabase } from "@/lib/supabase/client";

/**
 * Verifica si el usuario PUEDE cambiar su username al candidato dado.
 * - Si el candidato es igual (case-insensitive) al actual => permitido (no cambio real).
 * - Si el candidato está disponible vía RPC `username_is_available` => permitido.
 * - En otro caso => no permitido (ya está en uso o error).
 */
export async function canChangeUsername(currentUsername: string, candidate: string) {
  const normalizedCurrent = (currentUsername ?? "").trim().toLowerCase();
  const normalizedCandidate = (candidate ?? "").trim().toLowerCase();

  if (!normalizedCandidate) {
    return {
      canChange: false,
      available: false,
      normalized: normalizedCandidate,
      reason: "empty",
    };
  }

  if (normalizedCandidate === normalizedCurrent) {
    return {
      canChange: true,
      available: true,
      normalized: normalizedCandidate,
      reason: "unchanged",
    };
  }

  const { data, error } = await supabase.rpc("username_is_available", {
    p_username: normalizedCandidate,
  });

  if (error) {
    return {
      canChange: false,
      available: false,
      normalized: normalizedCandidate,
      reason: "rpc_error",
      error,
    };
  }

  const available = !!data;

  return {
    canChange: available,
    available,
    normalized: normalizedCandidate,
    reason: available ? "available" : "taken",
  };
}
