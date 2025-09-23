import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserProfile } from "../api/userApi";
import type { UserProfile } from "@/types/user";
import { isProfileComplete } from "@/types/user";

export function useProfileCompletion() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const p = await getCurrentUserProfile();
      setProfile(p);
    } catch (e) {
      console.error("[ONBOARD][hook] refresh error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Si auth cambia, refrescar
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === "SIGNED_IN" || evt === "TOKEN_REFRESHED") {
        refresh();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  // 🔔 Evento global
  useEffect(() => {
    const handler = () => {
      refresh();
    };
    window.addEventListener("profile:updated", handler);
    return () => window.removeEventListener("profile:updated", handler);
  }, [refresh]);

  const complete = useMemo(() => {
    const ok = isProfileComplete(profile);

    return ok;
  }, [profile]);

  return { loading, profile, complete, refresh };
}
