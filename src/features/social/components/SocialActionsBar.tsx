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

  /** ⬇️ Hidratan desde el feed (RPC v3) para evitar N+1 */
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

  /**
   * 🔁 IMPORTANTE:
   * Si el contador inicial de comentarios llega después del primer render,
   * rehidratar el estado inmediatamente (sin esperar al fallback fetch).
   */
  useEffect(() => {
    if (typeof initialCommentsCount === "number") {
      setCount(Math.max(0, initialCommentsCount));
    }
  }, [initialCommentsCount]);

  /**
   * Fallback: si NO llegó un valor inicial, hacemos un fetch único.
   * (En la mayoría de casos, con el RPC v3 esto no correrá).
   */
  useEffect(() => {
    if (typeof initialCommentsCount === "number") return; // ya hidratamos por props
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
