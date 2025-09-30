import { memo, useEffect, useState } from "react";
import { LikeButton } from "./LikeButton";
import { CommentsTrigger } from "./CommentsTrigger";
import { CommentsThread } from "./CommentsThread";
import { fetchCommentsCount } from "../api/socialApi";

type Props = {
  /** id de la sesión de entrenamiento (Entrenamientos.id_sesion) */
  sessionId: number;
  /** si true, el hilo de comentarios aparece abierto desde el inicio */
  defaultOpen?: boolean;

  /** ⬇️ NUEVOS: hidratan desde el feed para evitar N+1 */
  initialLikesCount?: number;
  initialLikedByMe?: boolean;
  initialCommentsCount?: number;
};

export const SocialActionsBar = memo(function SocialActionsBar({
  sessionId,
  defaultOpen = false,
  initialLikesCount,
  initialLikedByMe,
  initialCommentsCount,
}: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [count, setCount] = useState<number>(Math.max(0, initialCommentsCount ?? 0));

  // Si no vino un conteo inicial, hacemos un fetch único
  useEffect(() => {
    if (initialCommentsCount != null) return;
    let mounted = true;
    void fetchCommentsCount(sessionId)
      .then((n) => mounted && setCount(n))
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, [sessionId, initialCommentsCount]);

  return (
    <div className="flex items-center gap-2">
      <LikeButton sessionId={sessionId} initialCount={initialLikesCount} initialLikedByMe={initialLikedByMe} />
      <CommentsTrigger count={count} onOpen={() => setOpen(true)} />
      {open ? (
        <CommentsThread
          sessionId={sessionId}
          onClose={() => {
            setOpen(false);
            // refrescamos contador al cerrar (por si hubo deletes)
            void fetchCommentsCount(sessionId)
              .then(setCount)
              .catch(() => {});
          }}
        />
      ) : null}
    </div>
  );
});
