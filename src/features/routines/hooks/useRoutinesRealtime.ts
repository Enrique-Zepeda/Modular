import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

/** Mantiene uid actual y suscripción a cambios en Rutinas para ese owner */
export function useRoutinesRealtime({ onChange }: { onChange?: () => void }) {
  const [uid, setUid] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setUid(session?.user?.id);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUid(session?.user?.id);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel("rutinas-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "Rutinas", filter: `owner_uid=eq.${uid}` }, () =>
        onChange?.()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, onChange]);

  return { uid };
}
