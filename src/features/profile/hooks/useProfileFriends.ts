import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export type ProfileFriend = {
  id: string; // string para alinear con tipos existentes en friends.*
  username: string;
  nombre: string | null;
  avatarUrl: string | null;
};

type State =
  | { status: "idle" | "loading"; data: ProfileFriend[]; error: null }
  | { status: "success"; data: ProfileFriend[]; error: null }
  | { status: "error"; data: ProfileFriend[]; error: string };

function normalizeUsername(u?: string) {
  const x = (u ?? "").trim();
  return x.startsWith("@") ? x.slice(1) : x;
}

/**
 * Obtiene amistades de un usuario público por su username (perfil).
 * No requiere que el usuario actual sea el dueño del perfil.
 */
export function useProfileFriends(username: string | undefined) {
  const [state, setState] = useState<State>({
    status: "idle",
    data: [],
    error: null,
  });

  const normalized = useMemo(() => normalizeUsername(username), [username]);

  const fetcher = useCallback(async () => {
    if (!normalized) return;

    setState((s) => ({ ...s, status: "loading", error: null }));

    // 1) Buscar el id_usuario del perfil
    const { data: userRow, error: userErr } = await supabase
      .from("Usuarios")
      .select("id_usuario, username")
      .eq("username", normalized)
      .maybeSingle();

    if (userErr) {
      setState({ status: "error", data: [], error: userErr.message });
      return;
    }
    if (!userRow) {
      setState({ status: "success", data: [], error: null });
      return;
    }

    // 2) Traer pares de amigos (id_usuario1/id_usuario2)
    const { data: pairs, error: pairsErr } = await supabase
      .from("Amigos")
      .select("id_usuario1, id_usuario2")
      .or(`id_usuario1.eq.${userRow.id_usuario},id_usuario2.eq.${userRow.id_usuario}`);

    if (pairsErr) {
      setState({ status: "error", data: [], error: pairsErr.message });
      return;
    }

    const friendIds = Array.from(
      new Set((pairs ?? []).map((p) => (p.id_usuario1 === userRow.id_usuario ? p.id_usuario2 : p.id_usuario1)))
    );

    if (friendIds.length === 0) {
      setState({ status: "success", data: [], error: null });
      return;
    }

    // 3) Expandir datos públicos de amigos
    const { data: friends, error: fErr } = await supabase
      .from("Usuarios")
      .select("id_usuario, username, nombre, url_avatar")
      .in("id_usuario", friendIds);

    if (fErr) {
      setState({ status: "error", data: [], error: fErr.message });
      return;
    }

    const mapped: ProfileFriend[] =
      (friends ?? []).map((r) => ({
        id: String(r.id_usuario),
        username: r.username,
        nombre: r.nombre ?? null,
        avatarUrl: r.url_avatar ?? null,
      })) ?? [];

    setState({ status: "success", data: mapped, error: null });
  }, [normalized]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  const refetch = fetcher;

  return {
    friends: state.data,
    isLoading: state.status === "loading",
    isError: state.status === "error",
    error: state.status === "error" ? state.error : null,
    refetch,
  };
}
