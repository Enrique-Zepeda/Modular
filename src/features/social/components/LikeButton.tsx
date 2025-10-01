import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLikeLive } from "../hooks/useLikeLive";

type Props = {
  sessionId: number;
  /** Hidratación del feed (si la tienes desde feed_friends_workouts_v3) */
  initialCount?: number;
  initialLikedByMe?: boolean;
};

export function LikeButton({ sessionId, initialCount, initialLikedByMe }: Props) {
  const [myUid, setMyUid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMyUid(data.user?.id ?? null);
    })();
  }, []);

  // El hook arranca con los valores iniciales (no hace NINGUNA consulta por author_uid hasta que myUid sea UUID válido)
  const { likedByMe, count, toggle } = useLikeLive(sessionId, myUid, {
    initialLiked: initialLikedByMe,
    initialCount: initialCount,
  });

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => void toggle()}
        aria-pressed={likedByMe}
        aria-label={likedByMe ? "Quitar me gusta" : "Dar me gusta"}
        className={`h-8 w-8 p-0 rounded-lg transition-all ${
          likedByMe
            ? "text-red-500 hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-red-500"
            : "text-muted-foreground hover:bg-muted/60"
        }`}
      >
        <Heart className="h-4 w-4" fill={likedByMe ? "currentColor" : "none"} />
      </Button>
      <span className="text-sm tabular-nums">{count}</span>
    </div>
  );
}
