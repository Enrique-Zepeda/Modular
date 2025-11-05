import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Sexo } from "@/lib/avatar";

export type ProfileFriend = {
  id: string;
  username: string;
  nombre: string | null;
  avatarUrl: string | null;
  sexo: Sexo | null;
};

type State =
  | { status: "idle" | "loading"; data: ProfileFriend[]; error: null }
  | { status: "success"; data: ProfileFriend[]; error: null }
  | { status: "error"; data: ProfileFriend[]; error: string };

function normalizeUsername(u?: string) {
  const s = (u ?? "").replace(/^@+/, "").trim();
  return s || null;
}

function normalizeSexo(input: unknown): Sexo | null {
  if (input == null) return null;
  const x = String(input).trim().toLowerCase();

  // soporta variantes legacy
  if (x === "0") return "M";
  if (x === "1" || x === "2") return "F";
  if (["f", "fem", "femenino", "female", "mujer"].includes(x)) return "F";
  if (["m", "masc", "masculino", "male", "hombre"].includes(x)) return "M";
  if (x === "h") return "M";
  if (x === "m") return "F";
  if (x === "f") return "F";

  return null;
}

function sanitizeUrl(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || s === "null" || s === "undefined") return null;
  return s;
}

export function useProfileFriends(username?: string) {
  const [state, setState] = useState<State>({ status: "idle", data: [], error: null });
  const normalized = useMemo(() => normalizeUsername(username), [username]);

  const fetcher = useCallback(async () => {
    if (!normalized) return;
    setState((s) => ({ ...s, status: "loading", error: null }));

    try {
      // 1) id del perfil objetivo
      const { data: target, error: targetErr } = await supabase
        .from("Usuarios")
        .select("id_usuario")
        .ilike("username", normalized)
        .maybeSingle();
      if (targetErr) throw targetErr;
      const myId = Number(target?.id_usuario);
      if (!Number.isFinite(myId)) {
        setState({ status: "success", data: [], error: null });
        return;
      }

      // 2) filas de Amigos sin join (evita 400)
      const { data: rows, error: rowsErr } = await supabase
        .from("Amigos")
        .select("id_usuario1,id_usuario2")
        .or(`id_usuario1.eq.${myId},id_usuario2.eq.${myId}`);
      if (rowsErr) throw rowsErr;

      const otherIds = Array.from(
        new Set(
          (rows ?? [])
            .map((r: any) => (Number(r.id_usuario1) === myId ? Number(r.id_usuario2) : Number(r.id_usuario1)))
            .filter((n) => Number.isFinite(n))
        )
      ) as number[];

      if (otherIds.length === 0) {
        setState({ status: "success", data: [], error: null });
        return;
      }

      // 3) Traer perfiles de Usuarios con sexo y avatar
      const { data: users, error: usersErr } = await supabase
        .from("Usuarios")
        .select("id_usuario, username, nombre, url_avatar, sexo")
        .in("id_usuario", otherIds);
      if (usersErr) throw usersErr;

      const mapped: ProfileFriend[] = (users ?? []).map((u: any) => ({
        id: String(u.id_usuario ?? ""),
        username: String(u.username ?? ""),
        nombre: u.nombre ?? null,
        avatarUrl: sanitizeUrl(u.url_avatar),
        sexo: normalizeSexo(u.sexo),
      }));

      setState({ status: "success", data: mapped, error: null });
    } catch (e: any) {
      setState({ status: "error", data: [], error: e?.message ?? "No se pudo cargar amigos" });
    }
  }, [normalized]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  return {
    friends: state.data,
    isLoading: state.status === "loading",
    isError: state.status === "error",
    error: state.status === "error" ? state.error : null,
    refetch: fetcher,
  };
}
