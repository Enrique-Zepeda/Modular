import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { friendsFeedApi } from "../api/friendsFeedApi";
import { useSocialRealtime } from "@/features/social/hooks/useSocialRealtime";
import { supabase } from "@/lib/supabase/client";

/**
 * Mantiene en-sync los contadores del feed (listFriendsFeedRich) vía Realtime,
 * actualizando la cache de RTK Query sin refetch masivo.
 */
export function useFriendsFeedRealtime(sessionIds: number[], args: { limit?: number; before?: string } | void) {
  const dispatch = useDispatch();
  const ids = useMemo(
    () => Array.from(new Set((sessionIds || []).map((n) => Number(n)).filter(Boolean))),
    [sessionIds]
  );

  const [myUid, setMyUid] = useState<string | null>(null);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setMyUid(data.user?.id ?? null));
  }, []);

  useSocialRealtime(ids, {
    onLikeInsert: (row) => {
      dispatch(
        friendsFeedApi.util.updateQueryData("listFriendsFeedRich", args ?? ({ limit: 30 } as any), (draft) => {
          const it = draft.find((d: any) => Number(d.id_workout) === Number(row.id_sesion));
          if (!it) return;
          it.likes_count = (it.likes_count ?? 0) + 1;
          if (myUid && row.author_uid === myUid) it.liked_by_me = true;
        })
      );
    },
    onLikeDelete: (row) => {
      dispatch(
        friendsFeedApi.util.updateQueryData("listFriendsFeedRich", args ?? ({ limit: 30 } as any), (draft) => {
          const it = draft.find((d: any) => Number(d.id_workout) === Number(row.id_sesion));
          if (!it) return;
          it.likes_count = Math.max(0, (it.likes_count ?? 0) - 1);
          if (myUid && row.author_uid === myUid) it.liked_by_me = false;
        })
      );
    },
    onCommentInsert: (row) => {
      dispatch(
        friendsFeedApi.util.updateQueryData("listFriendsFeedRich", args ?? ({ limit: 30 } as any), (draft) => {
          const it = draft.find((d: any) => Number(d.id_workout) === Number(row.id_sesion));
          if (!it) return;
          it.comments_count = (it.comments_count ?? 0) + 1;
        })
      );
    },
    onCommentDelete: (row) => {
      dispatch(
        friendsFeedApi.util.updateQueryData("listFriendsFeedRich", args ?? ({ limit: 30 } as any), (draft) => {
          const it = draft.find((d: any) => Number(d.id_workout) === Number(row.id_sesion));
          if (!it) return;
          it.comments_count = Math.max(0, (it.comments_count ?? 0) - 1);
        })
      );
    },
  });
}
