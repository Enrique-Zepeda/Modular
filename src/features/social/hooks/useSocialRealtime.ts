import { useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SocialComment, SocialLike } from "@/types/social";

type Events = {
  onLikeInsert?: (row: SocialLike) => void;
  onLikeDelete?: (row: SocialLike) => void;
  onCommentInsert?: (row: SocialComment) => void;
  onCommentUpdate?: (row: SocialComment) => void;
  onCommentDelete?: (row: SocialComment) => void;
};

/** Suscripción Realtime para un conjunto de sesiones (ids visibles). */
export function useSocialRealtime(sessionIds: number[], handlers: Events) {
  const filter = useMemo(() => {
    if (!sessionIds?.length) return null;
    return `id_sesion=in.(${sessionIds.join(",")})`;
  }, [sessionIds]);

  useEffect(() => {
    if (!filter) return;

    const channel = supabase.channel(`social:${filter}`);

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "SocialLikes", filter }, (p) =>
        handlers.onLikeInsert?.(p.new as any)
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "SocialLikes", filter }, (p) =>
        handlers.onLikeDelete?.(p.old as any)
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "SocialComments", filter }, (p) =>
        handlers.onCommentInsert?.(p.new as any)
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "SocialComments", filter }, (p) =>
        handlers.onCommentUpdate?.(p.new as any)
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "SocialComments", filter }, (p) =>
        handlers.onCommentDelete?.(p.old as any)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, handlers]);
}
